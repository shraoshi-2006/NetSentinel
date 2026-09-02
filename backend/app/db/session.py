from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./netsentinel.db"
)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )
elif DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql+asyncpg://",
        "postgresql://",
        1
    )

# If DATABASE_URL points to the docker internal hostname 'postgres' and it cannot be resolved, fallback to SQLite for local dev
try:
    if "@postgres:" in DATABASE_URL or "@postgres/" in DATABASE_URL:
        import socket
        try:
            socket.gethostbyname("postgres")
        except (socket.gaierror, socket.herror):
            DATABASE_URL = "sqlite:///./netsentinel.db"
except Exception:
    pass

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()