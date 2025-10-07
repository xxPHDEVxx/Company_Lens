from langchain.schema import Document
from src.features.company_scraper.tools.loader import SubaltaLoader
from loguru import logger as logging
import random, requests

# List of user agents to rotate requests and avoid detection
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.89 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 15_7 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/537.36",
]

def get_random_header() -> dict:
    """
        Generate a random HTTP header to simulate different user agents.

        :return: A dictionary with HTTP headers
        """
    return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive",
        }


class CompanyScraper:
    """
    Web scraping utility class that uses a document loader to retrieve and validate web content.

    This class provides methods to validate URLs, check their accessibility,
    and load their content in the form of documents. It uses the SubaltaLoader by default,
    which captures full HTML pages. Random User-Agent headers are
    rotated for each request to reduce the risk of being blocked.

    Attributes:
        loader (SubaltaLoader): The document loader class to use for fetching web content.

    Methods:
        is_valid_format(url: str) -> bool:
            Checks if the URL is syntactically valid and not a search result link.

        is_accessible_url(url: str) -> bool:
            Checks if the URL is reachable and responds with an acceptable HTTP status code.

        is_valid_url(url: str) -> bool:
            Validates both the format and accessibility of the URL.

        load_web_content(url: str) -> List[Document]:
            Loads the content of a web page into a list of Documents.

        run(url: str) -> List[Document]:
            Executes the scraping process on a given URL and returns its content.
    """

    def __init__(self, loader = SubaltaLoader):
        # Initialize the scraper with a document loader
        self.loader = loader

    from urllib.parse import urlparse

    def is_accessible_url(self, url: str) -> bool:
        """Check if the URL responds with a valid HTTP status."""
        try:
            response = requests.head(
                url, headers=get_random_header(), allow_redirects=True, timeout=10
            )
            return response.status_code in [200, 405, 403] # method 'head' can be not allowed and return code 405 or 403
        except requests.RequestException as e:
            # Capture et affiche l'exception
            logging.error(f"Erreur lors de la requête HTTP pour l'URL {url} : {str(e)}")
            return False

    def is_valid_url(self, url: str) -> bool:
        "Check if the URL has been correctly formatted by the `format_url` method and is accessible."
        return url != None and self.is_accessible_url(url)

    def load_web_content(self, url: str) -> list[Document]:
        """
        Load web content from a URL using a document loader.

        :param url: The URL of the web page to retrieve.
        :return: A list of documents or an empty document if the URL is invalid.
        """
        if not self.is_valid_url(url):
            logging.warning("invalid url: " + url)
            return [Document("")]

        # Use the document loader with the given URL and headers
        loader = self.loader(url, get_random_header())
        documents = loader.load()  # Synchronous retrieval of documents
        return documents

    def run(self, url: str) -> list[Document]:
        """Execute the scraper on a given URL and return its content."""
        # logging.info(f"Loading URL: {url}")  # Debugging output
        return self.load_web_content(url)
