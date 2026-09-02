from typing import Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scan import Scan, Target, Port, Finding
from app.schemas.security_score import (
    SecurityScoreResponse,
    RiskBreakdown,
    CategoryScores,
    TopSecurityIssue,
    SecurityRecommendation,
    LastScanInfo,
    ScoreHistoryItem,
)
from app.services.scanner.security_score import (
    calculate_overall_security_score,
    calculate_risk_breakdown,
    calculate_category_scores,
    generate_recommendations,
    extract_top_issues,
)

router = APIRouter()


@router.get("", response_model=SecurityScoreResponse)
@router.get("/", response_model=SecurityScoreResponse)
def get_security_score(
    db: Session = Depends(get_db),
    scan_id: Optional[int] = Query(None, description="Specific scan ID to calculate score for"),
) -> Any:
    # If specific scan requested
    if scan_id:
        current_scan = db.query(Scan).filter(Scan.id == scan_id).first()
    else:
        # Get the latest completed scan, or if none completed, the latest scan
        current_scan = (
            db.query(Scan)
            .filter(Scan.status == "completed")
            .order_by(Scan.created_at.desc())
            .first()
        )
        if not current_scan:
            current_scan = db.query(Scan).order_by(Scan.created_at.desc()).first()

    # Query all completed scans for history trend
    all_completed_scans = (
        db.query(Scan)
        .filter(Scan.status == "completed")
        .order_by(Scan.created_at.asc())
        .limit(20)
        .all()
    )

    history_items = []
    for s in all_completed_scans:
        s_findings = db.query(Finding).filter(Finding.scan_id == s.id).all()
        s_ports = db.query(Port).filter(Port.scan_id == s.id).all()
        s_score, _ = calculate_overall_security_score(s_findings, s_ports)
        target_name = s.target.target if s.target else f"Target #{s.target_id}"
        history_items.append(
            ScoreHistoryItem(
                scan_id=s.id,
                target=target_name,
                date=s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
                score=s_score,
                scan_type=s.scan_type.capitalize() if s.scan_type else "Full",
            )
        )

    # If no scan exists in database at all
    if not current_scan:
        return SecurityScoreResponse(
            has_data=False,
            overall_score=None,
            rating=None,
            risk_breakdown=RiskBreakdown(),
            categories=CategoryScores(),
            top_issues=[],
            recommendations=[],
            last_scan=None,
            history=[],
        )

    # Fetch findings and ports for the current scan
    findings = db.query(Finding).filter(Finding.scan_id == current_scan.id).all()
    ports = db.query(Port).filter(Port.scan_id == current_scan.id).all()

    overall_score, rating = calculate_overall_security_score(findings, ports)
    breakdown_data = calculate_risk_breakdown(findings)
    categories_data = calculate_category_scores(findings, ports)
    top_issues_data = extract_top_issues(findings, limit=8)
    recommendations_data = generate_recommendations(findings, ports)

    target_name = (
        current_scan.target.target if current_scan.target else f"Target #{current_scan.target_id}"
    )

    last_scan_info = LastScanInfo(
        id=current_scan.id,
        target=target_name,
        scan_type=current_scan.scan_type.capitalize() if current_scan.scan_type else "Full",
        status=current_scan.status,
        date=current_scan.created_at.isoformat() if current_scan.created_at else None,
        vulnerabilities=len(findings),
        security_score=overall_score,
    )

    return SecurityScoreResponse(
        has_data=True,
        overall_score=overall_score,
        rating=rating,
        risk_breakdown=RiskBreakdown(**breakdown_data),
        categories=CategoryScores(**categories_data),
        top_issues=[TopSecurityIssue(**issue) for issue in top_issues_data],
        recommendations=[SecurityRecommendation(**rec) for rec in recommendations_data],
        last_scan=last_scan_info,
        history=history_items,
    )
