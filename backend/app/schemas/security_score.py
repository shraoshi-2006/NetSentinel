from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class RiskBreakdown(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0
    total: int = 0
    percentages: Dict[str, float] = {}


class CategoryScores(BaseModel):
    network_security: Optional[int] = None
    port_security: Optional[int] = None
    service_security: Optional[int] = None
    vulnerability_security: Optional[int] = None
    configuration_security: Optional[int] = None
    web_security: Optional[int] = None


class TopSecurityIssue(BaseModel):
    id: Optional[int] = None
    title: str
    category: str
    severity: str
    confidence: Optional[str] = None
    description: str
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    cve_id: Optional[str] = None


class SecurityRecommendation(BaseModel):
    title: str
    description: str
    priority: str
    category: str


class LastScanInfo(BaseModel):
    id: Optional[int] = None
    scan_number: Optional[int] = None
    target: Optional[str] = None
    scan_type: Optional[str] = None
    status: Optional[str] = None
    date: Optional[str] = None
    vulnerabilities: int = 0
    security_score: Optional[int] = None


class ScoreHistoryItem(BaseModel):
    scan_id: int
    scan_number: Optional[int] = None
    target: str
    date: str
    score: int
    scan_type: str


class SecurityScoreResponse(BaseModel):
    has_data: bool = True
    overall_score: Optional[int] = None
    rating: Optional[str] = None
    risk_breakdown: RiskBreakdown
    categories: CategoryScores
    top_issues: List[TopSecurityIssue] = []
    recommendations: List[SecurityRecommendation] = []
    last_scan: Optional[LastScanInfo] = None
    history: List[ScoreHistoryItem] = []
