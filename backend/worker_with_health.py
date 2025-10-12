#!/usr/bin/env python
"""
Run Celery worker with a simple health check HTTP server.
This allows running workers as web services on Render's free tier.
"""
import os
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread


class HealthCheckHandler(BaseHTTPRequestHandler):
    """Simple health check endpoint that returns 200 OK."""

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Suppress HTTP server logs to avoid clutter."""
        pass


def run_health_server(port=8000):
    """Run health check HTTP server."""
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    print(f"Health check server running on port {port}")
    server.serve_forever()


def run_celery_worker():
    """Run Celery worker for Django tasks."""
    worker_type = os.getenv('WORKER_TYPE', 'django')

    if worker_type == 'django':
        # Django worker handles default and priority queues
        cmd = [
            'celery', '-A', 'company_lens',
            'worker',
            '--loglevel=info',
            '--concurrency=2',
            '--queues=default,priority'
        ]
    else:
        print(f"Unknown WORKER_TYPE: {worker_type}")
        sys.exit(1)

    print(f"Starting Celery worker: {' '.join(cmd)}")
    subprocess.run(cmd)


if __name__ == '__main__':
    # Start health check server in background thread
    health_thread = Thread(target=run_health_server, daemon=True)
    health_thread.start()

    # Run Celery worker in main thread
    run_celery_worker()
