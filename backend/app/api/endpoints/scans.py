from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scan import Scan, Target
from app.schemas.scan import ScanCreate, ScanResponse
from app.services.scanner.scanner_task import scan_target

router = APIRouter()

@router.post("/", response_model=ScanResponse)
def create_scan(
    *,
    db: Session = Depends(get_db),
    scan_in: ScanCreate,
) -> Any:
    """
    Create new scan.
    """
    import re
    target_type = "IP" if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", scan_in.target) else "Domain"
    db_target = db.query(Target).filter(Target.target == scan_in.target).first()
    if not db_target:
        db_target = Target(target=scan_in.target, type=target_type)
        db.add(db_target)
        db.commit()
        db.refresh(db_target)

    scan = Scan(
        target_id=db_target.id,
        scan_type=scan_in.scan_type,
        status="pending",
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Trigger celery task
    scan_target.delay(scan.id)
    
    return scan

@router.get("/", response_model=List[ScanResponse])
def read_scans(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve scans.
    """
    scans = db.query(Scan).offset(skip).limit(limit).all()
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
def read_scan(
    *,
    db: Session = Depends(get_db),
    scan_id: int,
) -> Any:
    """
    Get scan by ID.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
