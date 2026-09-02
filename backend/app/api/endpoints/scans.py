from typing import Any, List, Optional
from datetime import datetime, timezone
import re
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scan import Scan, Target, Port, Finding
from app.schemas.scan import ScanCreate, ScanResponse
from app.services.scanner.nmap_scanner import NmapScanner
from app.services.scanner.risk_engine import calculate_risk_score

router = APIRouter()


def normalize_target_string(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("http://") or raw.startswith("https://"):
        parsed = urlparse(raw)
        if parsed.hostname:
            return parsed.hostname
    return raw.split("/")[0].split(":")[0].strip()


def run_scan(scan_id: int):
    db = next(get_db())

    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return

        target = db.query(Target).filter(Target.id == scan.target_id).first()
        if not target:
            scan.status = "failed"
            db.commit()
            return

        # Start scan
        scan.status = "running"
        scan.started_at = datetime.now(timezone.utc)
        db.commit()

        # Run scanner
        scanner = NmapScanner(target.target, scan_type=scan.scan_type)
        results = scanner.scan()

        db_ports = []

        # Save discovered ports
        for port_info in results.get("ports", []):
            db_port = Port(
                scan_id=scan.id,
                port_number=port_info["port"],
                protocol=port_info["protocol"],
                state=port_info["state"],
                service_name=port_info.get("service"),
                service_product=None,
                service_version=port_info.get("version"),
            )
            db.add(db_port)
            db_ports.append(db_port)

        db.commit()

        # Generate findings based on open ports
        db_findings = []

        for port in db_ports:
            if port.state != "open":
                continue

            if port.port_number == 21:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="Insecure FTP Service Exposed",
                    category="Network Services",
                    severity="High",
                    confidence="High",
                    description="FTP service is running on port 21. Standard FTP transmits credentials and data in cleartext.",
                    evidence="Port 21 is open.",
                    remediation="Disable plaintext FTP and use SFTP (SSH File Transfer Protocol) or FTPS with TLS.",
                ))
            elif port.port_number == 23:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="Unencrypted Telnet Service Exposed",
                    category="Network Services",
                    severity="Critical",
                    confidence="High",
                    description="Telnet service is running on port 23. Telnet lacks encryption and is vulnerable to credential theft via sniffing.",
                    evidence="Port 23 is open.",
                    remediation="Immediately disable Telnet and use SSH (Port 22) for remote terminal management.",
                ))
            elif port.port_number in [3306, 5432, 6379, 27017, 1433]:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title=f"Database Port ({port.service_name or port.port_number}) Exposed",
                    category="Database Security",
                    severity="High",
                    confidence="High",
                    description=f"Database service on port {port.port_number} is directly exposed to external network traffic.",
                    evidence=f"Port {port.port_number} ({port.service_name}) is open.",
                    remediation="Restrict database access using firewall rules, VPCs, or VPNs. Never expose raw database ports publicly.",
                ))
            elif port.port_number == 3389:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="Remote Desktop Protocol (RDP) Exposed",
                    category="Remote Access",
                    severity="High",
                    confidence="High",
                    description="RDP on port 3389 is exposed. Public RDP is a high-risk target for automated brute force and ransomware.",
                    evidence="Port 3389 is open.",
                    remediation="Restrict RDP behind a secure VPN with Multi-Factor Authentication (MFA).",
                ))
            elif port.port_number == 80:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="Plaintext HTTP Service Detected",
                    category="Web Security",
                    severity="Medium",
                    confidence="High",
                    description="Port 80 serves unencrypted HTTP traffic. Sensitive data can be intercepted by intermediate nodes.",
                    evidence="Port 80 is open.",
                    remediation="Configure automatic HTTP to HTTPS redirection and enable HSTS (Strict-Transport-Security).",
                ))
            elif port.port_number == 443:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="HTTPS / TLS Service Detected",
                    category="Web Security",
                    severity="Info",
                    confidence="High",
                    description="Secure HTTPS service is active on port 443.",
                    evidence="Port 443 is open with TLS support.",
                    remediation="Ensure valid SSL/TLS certificates and deprecate TLS 1.0/1.1 protocols.",
                ))
            elif port.port_number == 22:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title="SSH Remote Management Exposed",
                    category="Remote Access",
                    severity="Low",
                    confidence="High",
                    description="SSH daemon is listening on port 22.",
                    evidence="Port 22 is open.",
                    remediation="Disable password authentication in favor of SSH public keys, disable root login, and use fail2ban.",
                ))
            elif port.port_number in [3000, 8000, 8080, 8443, 9000]:
                db_findings.append(Finding(
                    scan_id=scan.id,
                    title=f"Application Service Port ({port.port_number}) Active",
                    category="Application Security",
                    severity="Low",
                    confidence="Medium",
                    description=f"Port {port.port_number} ({port.service_name or 'custom'}) is active.",
                    evidence=f"Port {port.port_number} is open.",
                    remediation="Verify whether this application endpoint requires public exposure or should be restricted.",
                ))

        for finding in db_findings:
            db.add(finding)

        db.commit()

        # Calculate risk score
        scan.risk_score = calculate_risk_score(db_findings, db_ports)

        # Complete scan
        scan.status = "completed"
        scan.completed_at = datetime.now(timezone.utc)
        db.commit()

        print(f"Scan {scan_id} completed successfully with {len(db_ports)} ports and {len(db_findings)} findings.")

    except Exception as e:
        print(f"Scan {scan_id} failed: {e}")
        try:
            scan = db.query(Scan).filter(Scan.id == scan_id).first()
            if scan:
                scan.status = "failed"
                scan.completed_at = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("", response_model=ScanResponse)
@router.post("/", response_model=ScanResponse)
def create_scan(
    *,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    scan_in: ScanCreate,
    x_user_id: Optional[str] = Header(None),
) -> Any:
    cleaned_target = normalize_target_string(scan_in.target)
    if not cleaned_target:
        raise HTTPException(status_code=400, detail="Invalid target specified.")

    target_type = (
        "IP"
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", cleaned_target)
        else "Domain"
    )

    # Find or create target
    db_target = (
        db.query(Target)
        .filter(Target.target == cleaned_target)
        .first()
    )

    if not db_target:
        db_target = Target(
            target=cleaned_target,
            type=target_type
        )
        db.add(db_target)
        db.commit()
        db.refresh(db_target)

    # Extract user ID
    user_key = x_user_id.strip() if x_user_id and x_user_id.strip() else None

    # Calculate user-specific sequential scan number (#1, #2, ...)
    if user_key:
        user_scan_count = db.query(Scan).filter(Scan.user_id == user_key).count()
    else:
        user_scan_count = db.query(Scan).filter(Scan.user_id.is_(None)).count()
    assigned_scan_number = user_scan_count + 1

    # Create scan
    scan = Scan(
        target_id=db_target.id,
        user_id=user_key,
        scan_number=assigned_scan_number,
        scan_type=scan_in.scan_type or "full",
        status="pending",
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Run scan in FastAPI background task
    background_tasks.add_task(run_scan, scan.id)

    return scan


@router.get("", response_model=List[ScanResponse])
@router.get("/", response_model=List[ScanResponse])
def read_scans(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    user_key = x_user_id.strip() if x_user_id and x_user_id.strip() else None
    query = db.query(Scan)

    if user_key:
        query = query.filter(Scan.user_id == user_key)
    else:
        # If no user header provided, show legacy/unassigned scans
        query = query.filter(Scan.user_id.is_(None))

    scans = (
        query
        .order_by(Scan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Fallback to ensure scan_number is always populated sequentially
    for idx, s in enumerate(scans):
        if s.scan_number is None or s.scan_number == 0:
            s.scan_number = len(scans) - idx

    return scans


@router.get("/{scan_id}", response_model=ScanResponse)
def read_scan(
    *,
    db: Session = Depends(get_db),
    scan_id: int,
    x_user_id: Optional[str] = Header(None),
) -> Any:
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id)
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    user_key = x_user_id.strip() if x_user_id and x_user_id.strip() else None
    # If the scan belongs to another user, restrict access
    if scan.user_id and user_key and scan.user_id != user_key:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    return scan