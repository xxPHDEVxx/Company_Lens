from typing import List

from langchain_core.embeddings.embeddings import Embeddings
from langchain_core.callbacks import BaseCallbackHandler
from langchain.chat_models.base import BaseChatModel


from src.core.models.amqp.chat.base_chat_request import BaseChatRequest
from src.core.proxies.runnable_proxy import RunnableProxy, Invokable


class ChatRunnableProxy(RunnableProxy):

    def __init__(
        self,
        name: str,
        models: List[BaseChatModel],
        embeddings: List[Embeddings],
        invokable: Invokable,
        callbacks: List[BaseCallbackHandler] = [],
    ):
        super().__init__(name, models, embeddings, invokable, callbacks)

    def invoke(self, request: BaseChatRequest):
        if self._runnable is None:
            self._init()
        return self._runnable.invoke(
            request.to_dict()["data"],
            {"configurable": {"session_id": request.session_id}},
        )

    def stream(self, request: BaseChatRequest):
        if self._runnable is None:
            self._init()
        for token in self._runnable.stream(
            request.to_dict()["data"],
            {"configurable": {"session_id": request.session_id}},
        ):
            yield token
