from concurrent.futures import ThreadPoolExecutor
from typing import Generic, TypeVar, List
from pydantic import BaseModel

from src.core.log import INFO

T = TypeVar("T")


class RunnableQuerryParalellizer(Generic[T]):
    def __init__(self, runnable, args: List[BaseModel]):
        self.runnable = runnable  # This can be a RunnableWrapper or any compatible object
        self.args = args

    def invoke(self) -> List[T]:
        INFO(f"Starting parallelized execution with {len(self.args)} arguments")
        with ThreadPoolExecutor(
            thread_name_prefix="openai_parallelizer", max_workers=max(len(self.args), 1)
        ) as executor:
            futures = [
                executor.submit(self.runnable.invoke, arg.model_dump())
                for arg in self.args
            ]
            return [future.result() for future in futures]
