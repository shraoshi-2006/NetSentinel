from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class ScanCreate(BaseModel):
    target: str
    scan_type: str # Quick, Standard, Full

class ScanResponse(BaseModel):
    id: int
    target_id: int
    scan_type: str
    status: str
    risk_score: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

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
