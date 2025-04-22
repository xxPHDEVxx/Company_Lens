from src.company_scraper.config.config import *
from src.company_scraper.tools.utils import *
from src.company_scraper.tools.format import *

scraper = CompanyScraper(WebBaseLoader)

def get_entity_information(vat_number: str):
    documents = scraper.run(URL.ENTITY_DETAILS.format(vat_number=vat_number))

    ready_content = handle_entities(documents)
    return ready_content[0].page_content if ready_content else ""

def handle_entities(documents: list[Document]) -> list[Document]:
    return convert_html_to_markdown(kbo_entity_format(documents))