from typing import Any, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scan import Scan, Target, Port, Finding
from app.schemas.scan import ScanCreate, ScanResponse
from app.services.scanner.nmap_scanner import NmapScanner
from app.services.scanner.risk_engine import calculate_risk_score

router = APIRouter()


def run_scan(scan_id: int):
    db = next(get_db())

    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()

        if not scan:
            return

        target = db.query(Target).filter(
            Target.id == scan.target_id
        ).first()

        if not target:
            scan.status = "failed"
            db.commit()
            return

        # Start scan
        scan.status = "running"
        scan.started_at = datetime.now(timezone.utc)
        db.commit()

        # Run scanner
        scanner = NmapScanner(target.target)
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

        # Generate findings
        db_findings = []

        for port in db_ports:

            if port.port_number == 21 and port.state == "open":
                finding = Finding(
                    scan_id=scan.id,
                    title="FTP Service Exposed",
                    category="Network",
                    severity="High",
                    confidence="High",
                    description="FTP service is exposed.",
                    evidence="Port 21 is open.",
                    remediation="Disable FTP or use SFTP.",
                )

                db.add(finding)
                db_findings.append(finding)

            elif port.port_number == 23 and port.state == "open":
                finding = Finding(
                    scan_id=scan.id,
                    title="Telnet Service Exposed",
                    category="Network",
                    severity="Critical",
                    confidence="High",
                    description="Telnet service is exposed.",
                    evidence="Port 23 is open.",
                    remediation="Disable Telnet and use SSH.",
                )

                db.add(finding)
                db_findings.append(finding)

        db.commit()

        # Calculate risk score
        scan.risk_score = calculate_risk_score(
            db_findings,
            db_ports
        )

        # Complete
        scan.status = "completed"
        scan.completed_at = datetime.now(timezone.utc)
        db.commit()

        print(f"Scan {scan_id} completed successfully.")

    except Exception as e:

        print(f"Scan {scan_id} failed: {e}")

        scan = db.query(Scan).filter(
            Scan.id == scan_id
        ).first()

        if scan:
            scan.status = "failed"
            scan.completed_at = datetime.now(timezone.utc)
            db.commit()

    finally:
        db.close()


@router.post("/", response_model=ScanResponse)
def create_scan(
    *,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    scan_in: ScanCreate,
) -> Any:

    import re

    target_type = (
        "IP"
        if re.match(
            r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$",
            scan_in.target
        )
        else "Domain"
    )

    # Find or create target
    db_target = (
        db.query(Target)
        .filter(Target.target == scan_in.target)
        .first()
    )

    if not db_target:
        db_target = Target(
            target=scan_in.target,
            type=target_type
        )

        db.add(db_target)
        db.commit()
        db.refresh(db_target)

    # Create scan
    scan = Scan(
        target_id=db_target.id,
        scan_type=scan_in.scan_type,
        status="pending",
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Run scan in FastAPI background task
    background_tasks.add_task(run_scan, scan.id)

    return scan


@router.get("/", response_model=List[ScanResponse])
def read_scans(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:

    return (
        db.query(Scan)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{scan_id}", response_model=ScanResponse)
def read_scan(
    *,
    db: Session = Depends(get_db),
    scan_id: int,
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

    return scan