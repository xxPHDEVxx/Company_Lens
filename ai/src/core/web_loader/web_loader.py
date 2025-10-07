

from abc import ABC, abstractmethod
from bs4 import BeautifulSoup

class WebLoader(ABC):
    """
    WebLoader is an abstract base class for loading web pages.
    Args:
        ABC (_type_): _description_
    """
    def __init__(self):
        pass

    @abstractmethod
    def load(self) -> BeautifulSoup:
        """
        Abstract method to load a web page.
        """
