from abc import ABC, abstractmethod
from langchain.prompts import PromptTemplate, ChatPromptTemplate


class PromptProvider(ABC):
    """
    PromptProvider is an abstract base class for providing prompts to the LLM.

    Args:
        ABC (_type_):
    """

    @abstractmethod
    def get_prompt(self) -> ChatPromptTemplate:
        """
        get_prompt method used to build the prompt for the LLM

        Returns:
            PromptTemplate: _description_
        """
