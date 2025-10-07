from typing import Any, List
from langchain_community.document_loaders import WebBaseLoader
from langchain.schema import Document

class SubaltaLoader(WebBaseLoader):
    """
    Custom loader that extends WebBaseLoader from langchain_community to retrieve full HTML content instead of plain text.

    This loader scrapes web pages, extracts metadata such as title, description, and language,
    and saves the entire HTML structure as the document's content. It is particularly useful
    when downstream applications require the raw HTML for further parsing, extraction, or analysis.

    Attributes:
        url (str): The URL to load.
        headers (dict): Custom HTTP headers to use during the request (typically with a random User-Agent).

    Methods:
        load() -> List[Document]: Loads HTML content and metadata for each URL.
    """

    def __init__(self, url: str, headers: dict):
        super().__init__(url, headers)

    def _build_metadata(self, soup: Any, url: str) -> dict:
        """Build metadata from BeautifulSoup output."""
        metadata = {"source": url}
        if title := soup.find("title"):
            metadata["title"] = title.get_text()
        if description := soup.find("meta", attrs={"name": "description"}):
            metadata["description"] = description.get(
                "content", "No description found."
            )
        if html := soup.find("html"):
            metadata["language"] = html.get("lang", "No language found.")
        return metadata

    def load(self) -> List[Document]:
        """Load HTML content from the URL(s) instead of plain text."""
        documents = []
        for path in self.web_paths:
            # Scrape the page using WebBaseLoader's method
            soup = self._scrape(path, bs_kwargs=self.bs_kwargs)

            # Build metadata the same way as WebBaseLoader
            metadata = self._build_metadata(soup, path)

            # Instead of soup.get_text(), we use str(soup) to get full HTML
            documents.append(Document(page_content=str(soup), metadata=metadata))

        return documents
