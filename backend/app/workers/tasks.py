from app.workers.celery_worker import celery_app
import asyncio

@celery_app.task(bind=True)
def run_scan_task(self, scan_id: int):
    """
    Entry point for running a scan asynchronously via Celery.
    Because our scanner logic uses asyncio, we use asyncio.run() here.
    """
    from app.services.scanner.engine import run_scan
    
    # Run the async scan engine synchronously inside the Celery worker
    asyncio.run(run_scan(scan_id))
    return f"Scan {scan_id} completed"
