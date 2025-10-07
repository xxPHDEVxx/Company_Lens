from src.core.models.amqp.chat.base_chat_request import BaseChatRequest
from src.core.utils.file_name_resolver import FileNameResolver
import json


class ChatBodyParser:

    def __init__(
        self,
        target: BaseChatRequest,
        file_name_resolver: FileNameResolver = FileNameResolver(),
    ):
        self.target: BaseChatRequest = target
        self.file_name_resolver: FileNameResolver = file_name_resolver

    def parse(self, body: bytes):
        data = json.loads(body.decode())
        chat_name = data["chat_name"]
        session_id = data["session_id"]
        del data["chat_name"]
        del data["session_id"]

        return self.target(chat_name=chat_name, session_id=session_id, data=data)

    def __str__(self):
        return self.parse()
