import time
from abc import ABC, abstractmethod
from typing import Generator, Union

from pydantic import BaseModel
from loguru import logger

import os
import pika


AMQP_BROKER_URL = os.getenv("AMQP_BROKER_URL")


class Adaworker(ABC):
    """Abstract class representing a worker that processes messages from a message queue.

    Methods:
        on_start():
            Method to be called when the worker starts. Must be implemented by subclasses.

        run(method: pika.spec.Basic.Deliver, properties: pika.spec.BasicProperties, body: bytes):
            Method to process a message from the queue. Calls the `work` method with the message
            body.

        work(body: bytes):
            Abstract method to define the work to be done with the message body. Must be
            implemented by subclasses.

        on_stop():
            Method to be called when the worker stops. Must be implemented by subclasses.

    Args:
        ABC (_type_): _description_
    """

    def on_start(self):
        """Method to be called when the worker starts.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        raise NotImplementedError()

    # pylint: disable=unused-argument
    def run(
        self,
        channel: pika.channel.Channel,
        method: pika.spec.Basic.Deliver,
        properties: pika.spec.BasicProperties,
        body: bytes,
    ):
        """Processes a message from the message queue.

        Args:
            channel (pika.channel.Channel): The channel object.
            method (pika.spec.Basic.Deliver): Delivery method.
            properties (pika.spec.BasicProperties): Message properties.
            body (bytes): The message body.
        """
        queue_name = method.routing_key  # Retrieve the queue name from the routing key
        logger.debug(f"Processing message from queue {queue_name}")
        intial_time = time.time()
        self.work(body)
        elapsed_time = time.time() - intial_time
        logger.debug(f"Elapsed time: {elapsed_time:.2f} seconds")

    @abstractmethod
    def work(self, body: bytes) -> Union[BaseModel, Generator[str, None, None]]:
        """
        Process the given byte data.
        Args:
            body (bytes): The data to be processed.

        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError()

    def on_stop(self):
        """Cleanup functions.

        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError()
