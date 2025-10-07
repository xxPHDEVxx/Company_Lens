"""
Module Name: core.runnable.runnable_querry_paralellizer

Description: This module contains the definition of the RunnableQuerryParalellizer class,
That must be used to parallelize the execution of the RunnableWrapper.

Author:
Date: 2025-05-19
"""

from concurrent.futures import ThreadPoolExecutor
from typing import Generic, TypeVar, List
from pydantic import BaseModel

from loguru import logger

from src.core.runnable.runnable_wrapper import RunnableWrapper

T = TypeVar("T")


class RunnableQuerryParalellizer(Generic[T]):
    """Class to parallelize the execution of the RunnableWrapper.

    Args:
        Generic (_type_): _description_
    """

    def __init__(self, runnable: RunnableWrapper, args: List[BaseModel]):
        self.runnable = runnable
        self.args = args

    def invoke(self) -> List[T]:
        """
        Invoke the runnable in parallel using ThreadPoolExecutor.
        """
        logger.debug(f"Starting parallelized execution with {len(self.args)} arguments")
        with ThreadPoolExecutor(
            thread_name_prefix="openai_parallelizer" + self.runnable.name,
            max_workers=max(len(self.args), 1),
        ) as executor:
            futures = [
                executor.submit(self.runnable.invoke, arg.model_dump())
                for arg in self.args
            ]
            return [future.result() for future in futures]
