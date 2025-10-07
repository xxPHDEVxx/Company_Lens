import json
from typing import Generic, TypeVar

from src.core.models.amqp.chat.base_chat_request import BaseChatRequest
from src.core.utils.file_name_resolver import FileNameResolver

T = TypeVar("T", bound=BaseChatRequest)


class AmqpBodyParser(Generic[T]):

    def __init__(
        self, target, file_name_resolver: FileNameResolver = FileNameResolver()
    ):
        self.__target: BaseChatRequest = target
        self.__file_name_resolver: FileNameResolver = file_name_resolver

    def parse(self, body: bytes) -> T:
        data = json.loads(body.decode())
        snake_case_data = {
            self.__file_name_resolver.convert(k): v for k, v in data.items()
        }
        return self.__target(**snake_case_data)
