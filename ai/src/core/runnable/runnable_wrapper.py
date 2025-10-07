from typing import Optional, TypeVar, Generic
from pydantic import BaseModel

from langchain.chat_models.base import BaseChatModel
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSerializable

from src.core.runnable.PromptProvider import PromptProvider
from src.core.runnable.callbacks.base_callback_handler import BaseCallbackHandler

T = TypeVar("T", bound=BaseModel)


class RunnableWrapper(Generic[T]):
    """
    Wrapper for llm calls.

    Args:
        Generic (_type_): _description_
    """

    def __init__(
        self,
        name: str,
        model: BaseChatModel,
        prompt: PromptProvider,
        output_type: Optional[type[T]] = None,
        callbacks: Optional[list[BaseCallbackHandler]] = None,
    ):
        if callbacks is None:
            callbacks = []
        self._name = name
        self.__model: BaseChatModel = model
        self.__prompt: ChatPromptTemplate = prompt.get_prompt()
        self.__output_type: Optional[type[T]] = output_type
        self.__callbacks = callbacks

        self._chain: RunnableSerializable = self._build_chain()

    @property
    def name(self) -> str:
        """Get the name of the runnable.

        Returns:
            str: _description_
        """
        return self._name
    
    def _build_chain(self):
        """
        Build the chain for the llm call.

        Returns:
            _type_: _description_
        """
        if self.__output_type is not None:
            model = self.__model.with_structured_output(self.__output_type)
        else:
            model = self.__model
        return self.__prompt | model

    def invoke(self, args: dict) -> T:
        """Invoke the llm call.

        Args:
            args (dict): _description_

        Returns:
            T: _description_
        """
        res = self._chain.with_listeners(*self.__callbacks).invoke(args)
        if self.__output_type is not None and not isinstance(res, self.__output_type):
            raise TypeError(
                f"Expected output of type {self.__output_type}, but got {type(res)}"
            )
        return res