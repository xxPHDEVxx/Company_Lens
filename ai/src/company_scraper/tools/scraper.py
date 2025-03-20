from langchain_core.document_loaders import BaseLoader
from langchain.schema import Document
from .utils import *
from urllib.parse import urlparse
import random, requests, logging

# List of user agents to rotate requests and avoid detection
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.89 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 15_7 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/15.7 Mobile/15E148 Safari/537.36",
]


class CompanyScraper:
    def __init__(self, loader: BaseLoader):
        # Initialize the scraper with a document loader
        self.loader = loader

    def is_valid_format(self, url: str) -> bool:
        """
        Check if a given URL is valid

        :param url: The URL to check
        :return: True if the URL is valid, False otherwise
        """
        if not url.startswith(("http://", "https://")):
            return False

        parsed_url = urlparse(url)

        # Avoid Google search links
        if "google.com" in parsed_url.netloc and "/search" in parsed_url.path:
            return False

        # Ensure the domain appears valid
        return bool(parsed_url.netloc and "." in parsed_url.netloc)

    def is_accessible_url(self, url: str) -> bool:
        """Check if the URL responds with a valid HTTP status."""
        try:
            response = requests.head(
                url, headers=self.get_random_header(), allow_redirects=True, timeout=10
            )
            return response.status_code in [200, 405, 403] # method 'head' can be not allowed and return code 405 or 403
        except requests.RequestException as e:
            # Capture et affiche l'exception
            logging.error(f"Erreur lors de la requête HTTP pour l'URL {url} : {str(e)}")
            return False

    def is_valid_url(self, url: str) -> bool:
        """Check if the URL is well-formed and accessible."""
        return self.is_valid_format(url) and self.is_accessible_url(url)

    def get_random_header(self) -> dict:
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

    def load_web_content(self, url: str) -> list[Document]:
        """
        Load web content from a URL using a document loader.

        :param url: The URL of the web page to retrieve.
        :return: A list of documents or an empty document if the URL is invalid.
        """
        if not self.is_valid_url(url):
            print(url)
            return [Document("")]

        # Use the document loader with the given URL and headers
        loader = self.loader(url, self.get_random_header())
        documents = loader.load()  # Synchronous retrieval of documents
        return documents

    def run(self, url: str) -> list[Document]:
        """Execute the scraper on a given URL and return its content."""
        logging.info(f"Loading URL: {url}")  # Debugging output
        return self.load_web_content(url)
