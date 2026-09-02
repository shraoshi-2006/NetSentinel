from fastapi import APIRouter

from app.api.endpoints import scans, security_score

api_router = APIRouter()
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(security_score.router, prefix="/security-score", tags=["security-score"])

