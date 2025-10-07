from langchain_core.runnables.base import RunnableBinding
from langchain_core.embeddings.embeddings import Embeddings

from typing import Callable, List
from langchain_core.callbacks import BaseCallbackHandler
from langchain.chat_models.base import BaseChatModel

from src.core.models.amqp.base_invoker_model import BaseInvokerModel

Invokable = Callable[[], RunnableBinding]


class DocumentEditorRunnableProxy:

    def __init__(
        self,
        name: str,
        models: List[BaseChatModel],
        embeddings: List[Embeddings],
        invokable: Invokable,
        callbacks: List[BaseCallbackHandler] = [],
    ):
        self._name: str = name
        self._models: List[BaseChatModel] = models
        self._invokable: Invokable = invokable
        self._runnable: RunnableBinding = None
        self._embeddings: List[Embeddings] = embeddings
        self._callbacks: List[BaseCallbackHandler] = callbacks
        self._args = [*self._models, *self._embeddings]

        pass

    def _init(self):
        self._runnable = self._invokable(*self._args).with_config(
            run_name=self._name, callbacks=self._callbacks
        )

    def stream(self, request: BaseInvokerModel):
        if self._runnable is None:
            self._init()
        for token in self._runnable.stream(request.to_dict()):
            yield token

    def invoke(self, request: BaseInvokerModel):
        if self._runnable is None:
            self._init()

        return self._runnable.invoke(request.to_dict())
