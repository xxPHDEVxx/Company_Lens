from abc import ABC, abstractmethod


class BaseCachedModel(ABC):

    def __init__(self):
        super().__init__()

    @abstractmethod
    def to_byte(self):
        raise NotImplementedError()

    @abstractmethod
    def from_byte(self, byte):
        raise NotImplementedError()
