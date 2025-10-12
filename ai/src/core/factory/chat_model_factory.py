import typing
import os

from langchain.chat_models.base import BaseChatModel
from langchain_openai import AzureChatOpenAI
from langchain_openai.chat_models import ChatOpenAI
from langchain_azure_ai.chat_models import AzureAIChatCompletionsModel

from src.core.log import INFO


class ChatModelFactory:
    _instance = None

    def __init__(self, **kwargs):
        self._llms = kwargs

    def __new__(cls, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            for key, value in kwargs.items():
                assert isinstance(
                    value, BaseChatModel
                ), "RunnableFactory only accepts BaseChatModel instances"
            cls._instance._llms = kwargs
        return cls._instance

    def get_llm(self, *names) -> typing.List[BaseChatModel]:
        llms = []
        for name in names:
            if name not in self._llms:
                raise RuntimeError(
                    f"Llm {name} not found. Select between {self._llms.keys()}"
                )
            llms.append(self._llms[name])
        return llms

    @staticmethod
    def create_factory():
        INFO("Creating ChatModelFactory")
        return ChatModelFactory(
            company_scrapper= ChatOpenAI(
                model_name="gpt-4o-mini",
                temperature=0
            )
        )
