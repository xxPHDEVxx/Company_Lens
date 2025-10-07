from abc import ABC, abstractmethod


class BaseAMQPResponse(ABC):

    @abstractmethod
    def to_json(self) -> dict | list | str | int | float:
        raise NotImplementedError()
