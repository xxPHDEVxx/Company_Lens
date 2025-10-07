from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel

Output = TypeVar("Output", bound=BaseModel, contravariant=True)


class CacheStorage(ABC, Generic[Output]):

    @abstractmethod
    def set(self, key: str, value: Output, expire: int = None):
        raise NotImplementedError()

    @abstractmethod
    def get(self, key: str) -> str | bytearray:
        raise NotImplementedError()

    @abstractmethod
    def delete(self, key: str):
        raise NotImplementedError()

    @abstractmethod
    def clear(self):
        raise NotImplementedError()
