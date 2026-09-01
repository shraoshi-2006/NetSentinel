from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class Target(Base):
    __tablename__ = "targets"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True, nullable=False) # The domain, IP, or URL
    type = Column(String, nullable=False) # URL, Domain, IP
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scans = relationship("Scan", back_populates="target")

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"))
    scan_type = Column(String, nullable=False) # Quick, Standard, Full
    status = Column(String, default="queued") # queued, running, completed, failed, cancelled
    risk_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    target = relationship("Target", back_populates="scans")
    findings = relationship("Finding", back_populates="scan")
    ports = relationship("Port", back_populates="scan")

class Port(Base):
    __tablename__ = "ports"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    port_number = Column(Integer, nullable=False)
    protocol = Column(String, nullable=False)
    state = Column(String, nullable=False)
    service_name = Column(String, nullable=True)
    service_product = Column(String, nullable=True)
    service_version = Column(String, nullable=True)

    scan = relationship("Scan", back_populates="ports")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False) # Critical, High, Medium, Low, Info
    confidence = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    references = Column(JSON, nullable=True)
    cve_id = Column(String, nullable=True)

    scan = relationship("Scan", back_populates="findings")
