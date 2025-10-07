import pika


class BaseAmqpConnection:

    def __init__(self, url: str, queue: str):
        super().__init__()
        self._url = url
        self._queue = queue
        self._connection: pika.connection.Connection = None
        self._channel: pika.channel.Channel = None

    def __connect(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(self._url))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=self._queue)
        self.channel.basic_consume(
            queue=self._queue, on_message_callback=self._callback_wrapper, auto_ack=True
        )
