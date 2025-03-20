from tools.utils import *
from tools.scraper import CompanyScraper
from tools.format import *
from config.config import *


def get_urls_to_scrape(fields: dict, urls: List[str]) -> List[str]:
    """
    Return a list of URLs by replacing placeholders with data.
    """
    vat_number = fields.get("vat_number")
    if not vat_number or not is_valid_vat(vat_number):
        return []
    final_urls = [
        (
            url.format(vat_number=vat_number) if is_kbo(url)
            else url.format(vat_number=format_vat(vat_number)))
        for url in urls
    ]
    return final_urls


def complete_address(adress_schema: AddressSchema):
    if adress_schema:
        # Retrieve address information from an external source
        address_data = get_data_from_address(adress_schema.full_address) or {}

        # Update address fields with retrieved data, using default values if keys are missing
        adress_schema.country = address_data.get("country", "")
        adress_schema.province = address_data.get("province", "")
        adress_schema.region = address_data.get("region", "")

        # If the region is still empty, try to determine it based on the postal code
        if not adress_schema.region and adress_schema.postal_code:
            region = find_region(adress_schema.postal_code)
            if region:
                adress_schema.region = region

def complete_financial(company_schema: CompanySchema):
    if company_schema:
        data = get_size_and_financial_data(company_schema.vat_number)
        company_schema.financial.company_size = data[0]
        company_schema.financial.number_of_employees = int(data[1]["employees"])
        company_schema.financial.gross_margin = int(data[1]["gross margin"])


def make_llm_ready_content(url: str) -> str:
    """
    Fetches web content from a given URL and converts it into Markdown format,
    making it suitable for processing by a Large Language Model (LLM).

    :param url: The URL of the web page to retrieve.
    :return: A string containing the cleaned and formatted content in Markdown.
    """
    scraper = CompanyScraper(AsyncHtmlLoader)
    documents = scraper.run(url)  # Load HTML content from the URL.

    # Apply the correct formatting function
    if is_company_tracker(url):
        documents = company_tracker_format(documents)
    elif is_kbo(url):
        documents = kbo_format(documents)

    # Convert formatted content to Markdown
    ready_content = convert_html_to_markdown(documents)

    return ready_content[0].page_content if ready_content else ""


def parallel_execution(urls: List[str]) -> str:
    """
    Perform parallel web scraping using multiple threads.

    param urls: A list of URLs to scrape.
    return: A single concatenated string containing the content of all scraped pages.
    """
    results = []
    if len(urls) > 0:
        max_workers = min(10, len(urls))  # Limit number of workers to 10
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = list(
                executor.map(make_llm_ready_content, urls)
            )  # Execute load_web_content in parallel
    return "\n\n---\n\n".join(results)  # Merge all extracted contents with separators


def extract_company_data(scraped_content: str):
    """
    Extract structured company data from raw scraped text using a Language Model (LLM).

    param scraped_content: The raw textual content extracted from the web.
    param llm: The LLM instance (BaseChatModel) used to process and extract structured data.

    return: A `CompanySchema` object containing structured company information.
    """
    # Extract data and complete schema
    model = LLM.GPT_3_5_TURBO.with_structured_output(CompanySchema)
    chain =  Prompt.EXTRACT_LEGAL_DATA| model
    company_schema = chain.invoke({"input": scraped_content})

    # Complexe missing address data
    complete_address(company_schema.address)
    complete_financial(company_schema)
    return company_schema


@traceable
def get_company_schema(fields) -> CompanySchema:
    """
    Retrieves and processes company data based on given input fields -> vat_number.

    :param fields (dict): A dictionary containing necessary input values,
                       such as a VAT number or additional parameters.

    :return dict or None: A structured company schema if data is successfully extracted,
                      otherwise `None`.
    """
    scraping_urls = get_urls_to_scrape(fields, URLS)
    llm_ready_content = parallel_execution(scraping_urls)
    company_schema = extract_company_data(llm_ready_content)
    if not company_schema:
        return None
    return company_schema
