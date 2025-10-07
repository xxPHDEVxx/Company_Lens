from typing import Callable, Generator, List, Union

from pydantic import BaseModel
from langchain_core.runnables.base import RunnableBinding
from langchain_core.embeddings.embeddings import Embeddings
from langchain_core.messages import AIMessageChunk
from langchain_core.callbacks import BaseCallbackHandler
from langchain.chat_models.base import BaseChatModel

from src.core.models.amqp.base_invoker_model import BaseInvokerModel

Invokable = Callable[[], RunnableBinding]


class RunnableProxy:
    """RunnableProxy is a proxy class for creating a runnable from a list of models and embeddings."""

    def __init__(
        self,
        name: str,
        models: List[BaseChatModel],
        embeddings: List[Embeddings],
        invokable: Invokable,
        callbacks: List[BaseCallbackHandler] = None,
    ):
        self._name = name
        self._models = models
        self._invokable = invokable
        self._runnable: RunnableBinding = None
        self._embeddings = embeddings
        self.callbacks = callbacks if callbacks is not None else []
        self._args = [*self._models, *self._embeddings]

    def _init(self):
        """Initializes the runnable with the given models and embeddings."""
        self._runnable = self._invokable(*self._args).with_config(
            run_name=self._name, callbacks=self.callbacks
        )

    # TODO check to return only string
    def stream(
        self, request: BaseInvokerModel
    ) -> Generator[Union[str, AIMessageChunk], None, None]:
        """Streams the output of the runnable for the given request.

        Args:
            request (BaseInvokerModel): The request to pass to the runnable.

        Yields:
            Generator[Union[str, AIMessageChunk]]: The output of the runnable.
        """
        if self._runnable is None:
            self._init()
        yield from self._runnable.stream(request.to_dict())

    def invoke(self, request: BaseInvokerModel) -> BaseModel:
        """Invokes the runnable with the given request.

        Args:
            request (BaseInvokerModel): The request to pass to the runnable.

        Returns:
            BaseModel: The output of the runnable.
        """
        if self._runnable is None:
            self._init()
        return self._runnable.invoke(request.to_dict())
