from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional, Any
from datetime import datetime

class ScanCreate(BaseModel):
    target: str
    scan_type: str = "full" # Quick, Standard, Full

class ScanResponse(BaseModel):
    id: int
    target_id: int
    target: Optional[str] = None
    scan_type: str
    status: str
    risk_score: Optional[int] = 0
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    findings: Optional[List["FindingResponse"]] = []
    ports: Optional[List["PortResponse"]] = []

    @field_validator("target", mode="before")
    @classmethod
    def extract_target_name(cls, v: Any) -> Optional[str]:
        if hasattr(v, "target"):
            return getattr(v, "target")
        if isinstance(v, str):
            return v
        return str(v) if v is not None else None

    class Config:
        from_attributes = True

class FindingResponse(BaseModel):
    id: int
    title: str
    category: str
    severity: str
    confidence: Optional[str]
    description: str
    evidence: Optional[str]
    remediation: Optional[str]
    cve_id: Optional[str]

    class Config:
        from_attributes = True

class PortResponse(BaseModel):
    id: int
    port_number: int
    protocol: str
    state: str
    service_name: Optional[str]
    service_product: Optional[str]
    service_version: Optional[str]

    class Config:
        from_attributes = True

class ScanReportResponse(BaseModel):
    scan: ScanResponse
    findings: List[FindingResponse]
    ports: List[PortResponse]
