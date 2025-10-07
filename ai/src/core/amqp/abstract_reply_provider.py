from abc import ABC, abstractmethod


class AbstractReplyProvider(ABC):

    @abstractmethod
    def on_start_communication(self):
        pass

    @abstractmethod
    def enqueue(self, message: str):
        pass

    @abstractmethod
    def run(self):
        pass

    @abstractmethod
    def send_eof(self):
        pass

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def on_communication_finished(self):
        pass

    @property
    @abstractmethod
    def queue_empty(self):
        pass
