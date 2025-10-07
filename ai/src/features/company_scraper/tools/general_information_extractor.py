from xml.dom.minidom import Document
from bs4 import BeautifulSoup
import markdownify
from src.core.network.header_utils import HeaderUtils
from src.core.network.web_client import WebClient
from src.features.company_scraper.config.urls import URL
from src.features.company_scraper.tools.format import convert_html_to_markdown, kbo_entity_format
from src.features.company_scraper.tools.utils import CompanyScraper
from loguru import logger

class GeneralInformationExtractor:
    
    def __init__(self, vat_number: str):
        self.__web_client = WebClient(headers=HeaderUtils.get_head_full_header())
        self.__vat_number = vat_number

    def extract(self) -> str:
        try:
            binaries = self.__web_client.get(URL.ENTITY_DETAILS.format(vat_number=self.__vat_number))
            soup = BeautifulSoup(binaries, "html.parser")
            cleaned_content = kbo_entity_format(soup)
            md_content: str = markdownify.markdownify(cleaned_content)
            return md_content
        
        except Exception as e:
            logger.error(f"Error in GeneralInformationExtractor: {e}", exc_info=True)
            return ""
    
    def kbo_entity_format(self, soup: BeautifulSoup) -> str:
        """
        KBO => Kruispunt bank voor Ondernemingen (baque carefour des entreprises)
        Formats the HTML from the Belgian Company Database (BCE), keeping tables but removing all links.

        :param documents: A list of documents to be processed, where the first document contains the HTML content.
        :return: The modified documents with cleaned-up content.
        """
        table_div = soup.find("div", id="table")

        if not table_div:
            return str(soup)

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

        return "".join(cleaned_content)


def get_entity_information(vat_number: str):
    documents = CompanyScraper().run(URL.ENTITY_DETAILS.format(vat_number=vat_number))

    ready_content = handle_entities(documents)
    return ready_content[0].page_content if ready_content else ""

def handle_entities(documents: list[Document]) -> list[Document]:
    return convert_html_to_markdown(kbo_entity_format(documents))
