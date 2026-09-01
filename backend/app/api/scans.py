from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.scan import Scan, Target, Finding, Port
from app.schemas.scan import ScanCreate, ScanResponse, FindingResponse, PortResponse, ScanReportResponse
from app.workers.tasks import run_scan_task
from app.services.scanner.target_validator import validate_target

router = APIRouter(prefix="/api/scans", tags=["scans"])

@router.post("", response_model=ScanResponse)
async def create_scan(scan_in: ScanCreate, db: AsyncSession = Depends(get_db)):
    # Validate the target
    try:
        target_type = validate_target(scan_in.target)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Check if target exists, else create
    stmt = select(Target).where(Target.target == scan_in.target)
    result = await db.execute(stmt)
    target = result.scalars().first()

    if not target:
        target = Target(target=scan_in.target, type=target_type)
        db.add(target)
        await db.flush() # To get the target ID
        
    # Create the scan record
    scan = Scan(
        target_id=target.id,
        scan_type=scan_in.scan_type,
        status="queued"
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    
    # Queue the Celery task
    run_scan_task.delay(scan.id)

    return scan

@router.get("", response_model=List[ScanResponse])
async def list_scans(db: AsyncSession = Depends(get_db)):
    stmt = select(Scan).order_by(Scan.created_at.desc()).limit(50)
    result = await db.execute(stmt)
    scans = result.scalars().all()
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: int, db: AsyncSession = Depends(get_db)):
    scan = await db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@router.get("/{scan_id}/findings", response_model=List[FindingResponse])
async def get_scan_findings(scan_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Finding).where(Finding.scan_id == scan_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{scan_id}/ports", response_model=List[PortResponse])
async def get_scan_ports(scan_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Port).where(Port.scan_id == scan_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{scan_id}/report", response_model=ScanReportResponse)
async def get_scan_report(scan_id: int, db: AsyncSession = Depends(get_db)):
    scan = await db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    stmt_findings = select(Finding).where(Finding.scan_id == scan_id)
    findings = (await db.execute(stmt_findings)).scalars().all()

    stmt_ports = select(Port).where(Port.scan_id == scan_id)
    ports = (await db.execute(stmt_ports)).scalars().all()

    return ScanReportResponse(
        scan=scan,
        findings=findings,
        ports=ports
    )
