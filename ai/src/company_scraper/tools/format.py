from langchain_community.document_transformers import MarkdownifyTransformer
from langchain.schema import Document
from src.company_scraper.tools.utils import safe_execution
import re
from src.company_scraper.config.config import *
transformer = MarkdownifyTransformer()


# Needs review and improvement for better performance
def kbo_entity_format(documents):
    """
    Formats the HTML from the Belgian Company Database (BCE), keeping tables but removing all links.

    :param documents: A list of documents to be processed, where the first document contains the HTML content.
    :return: The modified documents with cleaned-up content.
    """
    html = documents[0].page_content
    soup = BeautifulSoup(html, "html.parser")
    table_div = soup.find("div", id="table")

    if not table_div:
        return documents

    # Replace activity section title for easier LLM extraction
    for h2 in soup.find_all("h2"):
        if "Activités" in h2.text:
            h2.string = "Activités"

    # replace tags with class 'upd' content
    for tag in soup.find_all(class_="upd"):
        tag.string = "|" # Correct issues with the markdownify

    for tag in soup.find_all("sup"):
        tag.decompose()

    # Add Nacebel code for easier LLM extraction
    for table in soup.select('table:has(td.I h2:-soup-contains("Activités"))'):
        for a in table.find_all("a"):
            code = a.text.strip()
            if code.count(".") == 1 and len(code) == 6:  # Check for the format XX.XXX
                a.string = f"**code nacebel: {code}"

    # Clean up links before extraction
    for a in table_div.find_all("a"):
        a.replace_with(a.text)  # Replace the link with its textual content

    tables = table_div.find_all("table")
    cleaned_content = []

    # Process each table and clean the content
    for table in tables:
        for tr in table.find_all("tr"):
            # Remove style and class attributes
            for td in tr.find_all(["td", "th"]):
                td.attrs = {}
            cleaned_content.append(str(tr).replace("&nbsp;", " "))

    documents[0].page_content = "".join(cleaned_content)
    return documents

def kbo_establishment_units_format(documents) -> str:
    html = documents[0].page_content
    soup = BeautifulSoup(html, "html.parser")

    # Delete header and footer
    for tag in soup.find_all(["header", "footer"]):
        tag.decompose()

    return str(soup)

@safe_execution
def convert_html_to_markdown(documents: List[object]) -> List[Document]:
    """
    Converts a list of HTML documents into Markdown format.

    :param documents: A list of document objects containing HTML content.
    :return: A list of documents, where each document is the converted Markdown document.
    """
    converted = transformer.transform_documents(
        documents
    )  # Apply the transformation from HTML to Markdown

    return converted


def format_vat(vat_number: str) -> str:
    """Format a string as xxxx.xxx.xxx"""
    return f"{vat_number[:4]}.{vat_number[4:7]}.{vat_number[7:]}"


def is_valid_vat(vat: str) -> bool:
    """Checks if a string contains exactly 10 digits (VAT format)"""
    return bool(re.fullmatch(r"\d{10}", vat))


def is_aggregator(url: str, vat_number: str, company_name: str) -> bool:
    """Checks if the URL belongs to a known aggregator or contains company VAT number or name in its path."""
    if not isinstance(url, str) or not url.strip():
        return False

    # Parse URL components
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace("www.", "").casefold()
    path = parsed_url.path

    # Check if domain into aggregators list
    if domain in AGGREGATORS_DOMAINS:
        return True

    # Check if vat number into url path
    if is_valid_vat(vat_number):
        formatted_vat = format_vat(vat_number)
        if vat_number in path or formatted_vat in path:
            return True

    # Check if company name into path (without spaces and specials characters)
    normalized_company_name = re.sub(r"[^a-zA-Z0-9]", "", company_name.casefold())
    normalized_path = re.sub(r"[^a-zA-Z0-9]", "", path.casefold())

    if normalized_company_name in normalized_path:
        return True

    return False


def remove_aggregators_url(
    urls: List[str], vat_number: str, company_name: str
) -> List[str]:
    """Filters out aggregator URLs from a given list."""
    return [url for url in urls if not is_aggregator(url, vat_number, company_name)]
