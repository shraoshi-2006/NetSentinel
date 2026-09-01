import asyncio
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.scan import Scan, Port, Finding
from app.services.scanner.nmap_scanner import NmapScanner
from app.services.scanner.risk_engine import calculate_risk_score

@celery_app.task(name="scan_target")
def scan_target(scan_id: int):
    # Using celery with async functions requires a bit of an event loop hack
    # Or just run it synchronously if possible. For simplicity, we'll create a new loop.
    
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_scan_target_async(scan_id))

async def _scan_target_async(scan_id: int):
    db = SessionLocal()
    
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        db.close()
        return

    try:
        # Mark as in progress
        scan.status = "in_progress"
        db.commit()

        target = scan.target

        # 1. Port Scan
        nmap = NmapScanner(target)
        # Nmap is synchronous here to keep it simple, but we can make it async
        scan_results = nmap.scan()
        
        db_ports = []
        for port_info in scan_results.get("ports", []):
            db_port = Port(
                scan_id=scan.id,
                port_number=port_info["port"],
                protocol=port_info["protocol"],
                state=port_info["state"],
                service=port_info["service"],
                version=port_info["version"]
            )
            db.add(db_port)
            db_ports.append(db_port)
            
        db.commit() # Save ports

        # 2. Finding Generation (Basic examples based on open ports)
        db_findings = []
        for port in db_ports:
            if port.port_number == 21 and port.state == "open":
                finding = Finding(
                    scan_id=scan.id,
                    title="FTP Service Exposed",
                    description="The FTP service is exposed. This protocol is unencrypted and transmits credentials in cleartext.",
                    severity="High"
                )
                db.add(finding)
                db_findings.append(finding)
            if port.port_number == 23 and port.state == "open":
                finding = Finding(
                    scan_id=scan.id,
                    title="Telnet Service Exposed",
                    description="Telnet is an insecure protocol. It sends all data, including passwords, in plain text.",
                    severity="Critical"
                )
                db.add(finding)
                db_findings.append(finding)

        db.commit()

        # 3. Calculate Risk Score
        risk_score = calculate_risk_score(db_findings, db_ports)
        scan.risk_score = risk_score
        
        # Mark as completed
        scan.status = "completed"
        db.commit()

    except Exception as e:
        scan.status = "failed"
        db.commit()
        print(f"Scan {scan_id} failed: {e}")
    finally:
        db.close()
