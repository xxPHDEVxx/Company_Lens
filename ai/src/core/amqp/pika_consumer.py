import traceback
import time
import functools
import typing
import threading

import pika

from pika.channel import Channel
import pika.exceptions
from src.core.worker.ada_worker import Adaworker
from src.core.log import DEBUG, ERROR, INFO


class PikaConsumer:
    def __init__(
        self, amqp_url, queue, worker: typing.Type[Adaworker], prefetch_count=1
    ):
        self.connection_parameters = pika.ConnectionParameters(amqp_url, heartbeat=5)
        self.queue = queue
        self.prefetch_count = prefetch_count
        self.threads = []
        self.__connection: typing.Optional[pika.BaseConnection] = None
        self.__channel: typing.Optional[Channel] = None
        self.__worker = worker
        self.__i = 0

    def on_message(self, ch, method_frame, _header_frame, body):
        try:
            a = self.__worker()
            a.on_start()
            t = threading.Thread(
                target=a.run,
                args=(ch, method_frame, _header_frame, body),
                name=f"{self.queue} - {_header_frame.correlation_id}",
            )
            t.start()
            self.threads.append(t)
        except (pika.exceptions.AMQPError, pika.exceptions.ChannelError) as e:
            ERROR(f"Error in on_message: {e}")
            ERROR(f"Error in on_message: {e}\n{traceback.format_exc()}")

    def log_thread_count(self):
        while True:
            DEBUG(f"{self.queue} | Active threads: {threading.active_count()}")
            time.sleep(1)
            self.__i += 1
            if self.__i % 10 == 0:
                DEBUG(f"{self.queue} | Active threads: {threading.enumerate()}")

    def __connect(self):
        self.__connection = pika.BlockingConnection(self.connection_parameters)
        self.__channel = self.__connection.channel()
        self.__channel.queue_declare(queue=self.queue, durable=True)
        self.__channel.basic_qos(prefetch_count=self.prefetch_count)

        on_message_callback = functools.partial(self.on_message)
        self.__channel.basic_consume(
            on_message_callback=on_message_callback, queue=self.queue, auto_ack=True
        )

    def start_consuming(self):
        while True:
            try:
                INFO(f"Trying to connect to {self.connection_parameters.host}")
                self.__connect()
                INFO(f"Connected to {self.connection_parameters.host}")
                self.__channel.start_consuming()
            except pika.exceptions.ConnectionClosedByBroker as e:
                ERROR(f"Connection lost. Reconnecting in 5 secondes...\n{e}")
                time.sleep(5)
            except pika.exceptions.AMQPConnectionError as e:
                ERROR(f"AMQP Connection error. Reconnecting in 5 secondes...\n{e}")
                time.sleep(5)
            except KeyboardInterrupt as e:
                INFO("KeyboardInterrupt received. Stopping...")
                self.__channel.stop_consuming()
                break
            finally:
                self.__channel = None
            

        # Wait for all threads to complete
        for thread in self.threads:
            thread.join()

        self.__connection.close()
