#!/usr/bin/env python
"""
Celery Worker Manager - Simple process manager for Celery workers
Ensures only one instance of each worker runs at a time.
"""

import os
import sys
import signal
import subprocess
from pathlib import Path

# Paths
BACKEND_DIR = Path(__file__).parent.parent
AI_DIR = BACKEND_DIR.parent / "ai"
PIDFILE_DIR = Path("/tmp/celery")
BACKEND_LOGFILE_DIR = BACKEND_DIR / "logs"
AI_LOGFILE_DIR = AI_DIR / "logs"

# Ensure directories exist
PIDFILE_DIR.mkdir(exist_ok=True)
BACKEND_LOGFILE_DIR.mkdir(exist_ok=True)
AI_LOGFILE_DIR.mkdir(exist_ok=True)


class CeleryWorkerManager:
    """Manages Celery workers."""

    def __init__(self):
        self.workers = {
            'django': {
                'dir': BACKEND_DIR,
                'app': 'company_lens',
                'queue': 'default',
                'concurrency': 2,
                'pidfile': PIDFILE_DIR / 'django_worker.pid',
                'logfile': BACKEND_LOGFILE_DIR / 'celery_django.log',
            },
            'ai': {
                'dir': AI_DIR,
                'app': 'src.celery_app',
                'queue': 'scraper',
                'concurrency': 1,
                'pidfile': PIDFILE_DIR / 'ai_worker.pid',
                'logfile': AI_LOGFILE_DIR / 'celery_ai.log',
            }
        }

    def start(self, worker_name=None):
        """Start workers."""
        workers_to_start = [worker_name] if worker_name else list(self.workers.keys())

        for name in workers_to_start:
            config = self.workers[name]

            # Check if already running
            if self.is_running(name):
                print(f"  {name.capitalize()} worker already running (PID: {self.get_pid(name)})")
                continue

            print(f"  Starting {name} worker...")

            # Prepare command
            cmd = [
                'celery', '-A', config['app'],
                'worker',
                '-Q', config['queue'],
                '-l', 'info',
                '--concurrency', str(config['concurrency']),
                '--logfile', str(config['logfile']),
            ]

            try:
                # Prepare environment
                env = os.environ.copy()

                if name == 'ai':
                    # Use poetry for AI worker
                    cmd = ['poetry', 'run'] + cmd
                else:
                    # Use venv for Django worker
                    env['VIRTUAL_ENV'] = str(BACKEND_DIR / '.venv')
                    env['PATH'] = f"{BACKEND_DIR / '.venv' / 'bin'}:{env['PATH']}"

                # Start worker in background
                logfile = open(config['logfile'], 'a')
                process = subprocess.Popen(
                    cmd,
                    cwd=config['dir'],
                    env=env,
                    stdout=logfile,
                    stderr=subprocess.STDOUT,
                    start_new_session=True
                )

                # Save PID
                config['pidfile'].write_text(str(process.pid))
                print(f"  {name.capitalize()} worker started (PID: {process.pid})")

            except Exception as e:
                print(f"  Failed to start {name} worker: {e}")

    def stop(self, worker_name=None):
        """Stop workers."""
        workers_to_stop = [worker_name] if worker_name else list(self.workers.keys())

        for name in workers_to_stop:
            if not self.is_running(name):
                print(f"  {name.capitalize()} worker not running")
                continue

            print(f"  Stopping {name} worker...")

            try:
                pid = self.get_pid(name)
                os.kill(pid, signal.SIGTERM)

                # Clean up pidfile
                self.workers[name]['pidfile'].unlink(missing_ok=True)
                print(f"  {name.capitalize()} worker stopped")

            except Exception as e:
                print(f"  Failed to stop {name} worker: {e}")

    def restart(self, worker_name=None):
        """Restart workers."""
        workers_to_restart = [worker_name] if worker_name else list(self.workers.keys())

        for name in workers_to_restart:
            print(f"  Restarting {name} worker...")
            self.stop(name)
            self.start(name)

    def status(self):
        """Show status of all workers."""
        print("\nCelery Workers Status\n")
        print("-" * 60)

        for name, config in self.workers.items():
            pid = self.get_pid(name)
            status = "RUNNING" if pid else "STOPPED"
            pid_str = f"(PID: {pid})" if pid else ""

            print(f"{name.upper():10} {status:15} {pid_str}")
            print(f"  Queue: {config['queue']}")
            print(f"  Log: {config['logfile']}")
            print()

        print("-" * 60)

    def is_running(self, worker_name):
        """Check if worker is running."""
        pidfile = self.workers[worker_name]['pidfile']

        if not pidfile.exists():
            return False

        try:
            pid = int(pidfile.read_text().strip())
            # Check if process exists
            os.kill(pid, 0)
            return True
        except (ValueError, ProcessLookupError, OSError):
            # PID file exists but process doesn't
            pidfile.unlink(missing_ok=True)
            return False

    def get_pid(self, worker_name):
        """Get PID of worker if running."""
        if self.is_running(worker_name):
            return int(self.workers[worker_name]['pidfile'].read_text().strip())
        return None


def main():
    """CLI interface."""
    manager = CeleryWorkerManager()

    if len(sys.argv) < 2:
        print("Usage: python celery_manager.py {start|stop|restart|status} [worker_name]")
        print("\nWorkers: django, ai")
        print("\nExamples:")
        print("  python celery_manager.py start          # Start all workers")
        print("  python celery_manager.py start django   # Start only Django worker")
        print("  python celery_manager.py status         # Show status")
        sys.exit(1)

    command = sys.argv[1]
    worker = sys.argv[2] if len(sys.argv) > 2 else None

    if worker and worker not in manager.workers:
        print(f"Unknown worker: {worker}")
        print(f"Available workers: {', '.join(manager.workers.keys())}")
        sys.exit(1)

    if command == 'start':
        manager.start(worker)
    elif command == 'stop':
        manager.stop(worker)
    elif command == 'restart':
        manager.restart(worker)
    elif command == 'status':
        manager.status()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: start, stop, restart, status")
        sys.exit(1)


if __name__ == '__main__':
    main()
