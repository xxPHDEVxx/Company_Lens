


from bs4 import BeautifulSoup
from src.core.network.header_utils import HeaderUtils
from src.core.network.web_client import WebClient
from src.core.web_loader.web_loader import WebLoader


class HeadfullWebLoader(WebLoader):
    """
    Wen loader that uses a headfull browser to load the page.
    Using FAKE_USER_AGENT to avoid detection.

    Args:
        WebLoader (_type_): _description_
    """
    def __init__(self):
        self.driver = WebClient(headers=HeaderUtils.get_head_full_header())

    def load(self, url: str) -> BeautifulSoup:
        response = self.driver.get(url)
        return BeautifulSoup(response, "html.parser")