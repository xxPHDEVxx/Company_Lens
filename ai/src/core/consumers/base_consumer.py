import pika
from core.worker.ada_worker import Adaworker


class BaseConsumer(Adaworker):
    """BaseConsumer is a base class for creating consumers that connect to a message queue using the
    pika library.

    Attributes:
        _url (str): The URL of the message broker.
        _queue (str): The name of the queue to consume messages from.
        connection (pika.connection.Connection): The connection to the message broker.
        channel (pika.channel.Channel): The channel for communicating with the message broker.

    Methods:
        __init__(url: str, queue: str):
            Initializes the BaseConsumer with the given URL and queue name.

        __connect():
            Establishes a connection to the message broker and sets up the channel and queue.

        _callback_wrapper(channel: pika.channel.Channel, method: pika.spec.Basic.Deliver,
                            properties: pika.spec.BasicProperties, body: bytes):
            Wraps the callback function to be called when a message is received.

        _callback(channel: pika.channel.Channel, method: pika.spec.Basic.Deliver,
                            properties: pika.spec.BasicProperties, body: bytes):
            Abstract method to be implemented by subclasses to handle received messages.

        on_start():
            Called when the consumer starts. Establishes the connection to the message broker.

        run():
            Starts consuming messages from the queue.

        on_stop():
            Called when the consumer stops. Closes the channel and connection to the message broker.
    """

    def __init__(self, url: str, queue: str):
        super().__init__()
        self._url = url
        self._queue = queue
        self.connection: pika.connection.Connection = None
        self.channel: pika.channel.Channel = None

    def __connect(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(self._url))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=self._queue)
        self.channel.basic_consume(
            queue=self._queue, on_message_callback=self._callback_wrapper, auto_ack=True
        )

    def _callback_wrapper(
        self,
        channel: pika.channel.Channel,
        method: pika.spec.Basic.Deliver,
        properties: pika.spec.BasicProperties,
        body: bytes,
    ):
        self._callback(channel, method, properties, body)

    def _callback(
        self,
        channel: pika.channel.Channel,
        method: pika.spec.Basic.Deliver,
        properties: pika.spec.BasicProperties,
        body: bytes,
    ):
        raise NotImplementedError()

    def on_start(self):
        self.__connect()

    def run(self):
        self.channel.start_consuming()

    def on_stop(self):
        if self.channel is not None and self.channel.is_open:
            self.channel.close()
        if self.connection is not None and self.connection.is_open:
            self.connection.close()
