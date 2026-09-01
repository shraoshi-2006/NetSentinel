import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# We default to a standard Redis URL, which will be used in Docker/Production
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "netsentinel_worker",
    broker=redis_url,
    backend=redis_url,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)
