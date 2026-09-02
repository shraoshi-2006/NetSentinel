from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401

from sqlalchemy import text

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Ensure user_id column exists in scans table (backwards-compatible schema upgrade)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE scans ADD COLUMN user_id VARCHAR"))
        conn.commit()
except Exception:
    pass


app = FastAPI(
    title="NetSentinel API",
    description="Backend API for NetSentinel, a network and web vulnerability scanner platform.",
    version="1.0.0",
)

# Enable CORS for frontend clients (local, LAN, Vercel, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok"}
