from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.task_routes = {"app.services.scanner.scanner_task.scan_target": "main-queue"}
celery_app.conf.task_always_eager = True
