from langchain_community.document_transformers import MarkdownifyTransformer
from .utils import safe_execution
import re
from config.config import *
transformer = MarkdownifyTransformer()


# Needs review and improvement for better performance
def kbo_format(documents):
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

    # Modify the text "Type d'entité:" to "Company type:"
    for td in soup.find_all("td"):
        if "Type d'entité:" in td.text:
            td.string = td.text.replace("Type d'entité:", "Company type:")
        elif "Dénomination:" in td.text:
            td.string = "Name"

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


# Needs review and improvement for better performance
def company_tracker_format(documents):
    """
    Formats the HTML from the companyTracker website.
    Extracts the first two <div> elements with the class 'panel-body' from the given HTML
    and returns a formatted HTML containing only these two <div> elements.

    :param documents: List of documents containing the HTML content to be formatted.
    :return: A list of documents with formatted HTML containing only the first two <div class="panel-body"> elements.
    """
    html = documents[0].page_content
    soup = BeautifulSoup(html, "html.parser")

    # Find all <div> elements with the class 'panel-body'
    panel_primary = soup.find_all("div", class_="panel panel-primary")

    # Create a new HTML with the first two <div> elements
    documents[0].page_content = "".join(str(div) for div in panel_primary)
    return documents


def is_kbo(url):
    """
    Checks if the given URL corresponds to the KBO (Crossroads Bank for Enterprises) website.
    """
    return url.startswith("https://kbopub.economie.fgov.be/")


def is_company_tracker(url):
    """
    Checks if the given URL corresponds to the CompanyTracker website.
    """
    return url.startswith("https://www.companytracker.be/fr/")


@safe_execution
def convert_html_to_markdown(documents: List[object]) -> List[object]:
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

    # Vérifie si le domaine est dans la liste des agrégateurs
    if domain in AGGREGATORS_DOMAINS:
        return True

    # Vérifie si le numéro de TVA est présent dans le chemin de l'URL
    if is_valid_vat(vat_number):
        formatted_vat = format_vat(vat_number)
        if vat_number in path or formatted_vat in path:
            return True

    # Vérifie si le chemin de l'URL contient le nom de l'entreprise (sans espaces, tirets et underscores)
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
