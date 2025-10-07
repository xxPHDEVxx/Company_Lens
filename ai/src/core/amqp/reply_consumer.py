import threading
import queue
import time
import pika

from src.core.amqp.abstract_reply_provider import AbstractReplyProvider
from src.core.amqp.amqp_connection import BaseAmqpConnection
from src.core.log import DEBUG


class ReplyProvider(threading.Thread, BaseAmqpConnection, AbstractReplyProvider):

    def __init__(self, url: str, q: str):
        DEBUG(f"Initializing ReplyProvider with {url} and {q}")
        threading.Thread.__init__(self, name=f"ReplyProvider-{q}")
        BaseAmqpConnection.__init__(self, url, q)
        self._url = url
        self._queue = q
        self.connection: pika.connection.Connection = None
        self.channel: pika.channel.Channel = None

        self.properties = None

        self.__queue = queue.Queue()
        self.__running = True

    def on_start_communication(self):
        self.__running = True

    def enqueue(self, message: str):
        # DEBUG(f"Enqueing {message}")
        self.__queue.put(message)

    def run(self):
        DEBUG(f"Starting ReplyProvider at {id(self)} ({self.__running})")
        while self.__running:
            time.sleep(0.01)
            while not self.__queue.empty():
                # DEBUG("Emptying queue")
                message = self.__queue.get()
                self.reply(message)

    def reply(self, data: ChatResponseDto):
        if self.properties is None:
            raise ValueError("Properties not set")
        if self.properties.reply_to is None:
            raise ValueError("Reply to not set")
        self.channel.basic_publish(
            exchange="",
            routing_key=self.properties.reply_to,
            properties=pika.BasicProperties(
                correlation_id=self.properties.correlation_id
            ),
            body=data.to_json().encode(),
        )

    def send_eof(self):
        DEBUG("Sending EOF")
        resp = ChatResponseDto(content="", is_response=True, status=EChatStatus.EOF)
        self.enqueue(resp)

    def connect(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(self._url))
        self.channel = self.connection.channel()

    def on_communication_finished(self):
        self.__running = False

    @property
    def queue_empty(self):
        return self.__queue.empty()
