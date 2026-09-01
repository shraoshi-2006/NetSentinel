import asyncio
from datetime import datetime, timezone
import traceback

from app.db.session import async_session_maker
from app.models.scan import Scan, Target

# Import analysis modules
# from app.services.scanner.port_scanner import scan_ports
# from app.services.scanner.http_analyzer import analyze_http
# from app.services.scanner.dns_analyzer import analyze_dns
# from app.services.scanner.tls_analyzer import analyze_tls
from app.services.scanner.risk_engine import calculate_risk_score

async def run_scan(scan_id: int):
    async with async_session_maker() as db:
        scan = await db.get(Scan, scan_id)
        if not scan:
            return
        
        target = await db.get(Target, scan.target_id)
        
        try:
            scan.status = "running"
            scan.started_at = datetime.now(timezone.utc)
            await db.commit()
            
            # --- EXECUTE SCAN MODULES ---
            # Quick Scan: Ports, HTTP, TLS
            # Standard Scan: Quick + DNS + NVD
            # Full Scan: Standard + Shodan + VirusTotal
            
            host_or_ip = extract_hostname(target.target)

            # Placeholder for modules - will implement in next steps
            # ports = await scan_ports(host_or_ip, scan_type=scan.scan_type)
            # await save_ports(db, scan_id, ports)

            # findings = []
            # findings.extend(await analyze_dns(host_or_ip))
            
            # if target.type == "URL" or "http" in [p.service_name for p in ports]:
            #     findings.extend(await analyze_http(target.target))
            #     findings.extend(await analyze_tls(host_or_ip))
            
            # await save_findings(db, scan_id, findings)

            # Calculate Risk Score based on findings and ports
            # score = calculate_risk_score(findings, ports)
            # scan.risk_score = score
            
            scan.status = "completed"
            
        except Exception as e:
            scan.status = "failed"
            print(f"Scan {scan_id} failed: {e}")
            traceback.print_exc()
        finally:
            scan.completed_at = datetime.now(timezone.utc)
            await db.commit()

def extract_hostname(target: str) -> str:
    if target.startswith("http://") or target.startswith("https://"):
        from urllib.parse import urlparse
        return urlparse(target).hostname
    return target
