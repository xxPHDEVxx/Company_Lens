from src.core.worker.ada_worker import Adaworker
from loguru import logger
from typing import List

import threading
import signal


class ThreadWrapper:

    def __init__(self, thread: threading.Thread, worker: Adaworker):
        self.thread = thread
        self.worker = worker


class workerManager:
    def __init__(self):
        self.threads: List[ThreadWrapper] = []
        self._setup_signal_handling()

    def _setup_signal_handling(self):
        signal.signal(signal.SIGINT, self._signal_handler)

    def _signal_handler(self, sig, frame):
        print("Ctrl+C detected. Stopping threads...")
        self.stop_all_threads()

    def register_worker(self, thread_class: type[Adaworker], *args, **kwargs):
        try:
            logger.debug(f"Register thread {thread_class.__name__}")
            worker = thread_class(*args, **kwargs)
            worker.on_start()
            self.threads.append(worker)
        except Exception as e:
            logger.error(f"Error starting thread {thread_class.__name__}: {e}")

    def run(self):
        for thread in self.threads:
            logger.debug(f"Starting thread {thread.__class__.__name__}")
            thread.start()

    def stop_all_threads(self):
        logger.info("Stopping all threads")
        for thread in self.threads:
            logger.debug(f"Stopping thread {thread.__class__.__name__}")
            thread.on_stop()
        for thread in self.threads:
            thread.thread.join()
        logger.info("All threads have been stopped.")
