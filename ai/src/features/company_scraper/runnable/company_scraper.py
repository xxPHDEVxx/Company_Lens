from langsmith import traceable
from loguru import logger
from src.core.models.scrape.scrape_company_dto import ScrapeCompanyDto
from src.features.company_scraper.runnable.legal_data import LegalDataExtractor
from src.features.company_scraper.runnable.company_description import (
    CompanyWebsiteExtractor,
)
from src.features.company_scraper.schema.company_schema import CompanySchema


@traceable
def run(fields: ScrapeCompanyDto) -> CompanySchema:
    """
    Runs the company data extraction process.

    This function takes a dictionary containing company details(vat_number and website), extracts legal and 
    financial information using public data sources, and enriches it with additional 
    information from the company's website.

    :param fields: A dictionary containing company information. 
                       Must include the 'vat_number' key.

    :return dict: A structured schema containing extracted company data.
    """

    legal_extractor = LegalDataExtractor(fields.vat_number, fields.website)
    company_data: CompanySchema = legal_extractor.get_company_schema()

    # If scraping failed (e.g., address resolution failed), return None
    if company_data is None:
        logger.error(f"Failed to scrape company data for VAT {fields.vat_number}")
        return None

    website_extractor = CompanyWebsiteExtractor()
    if fields.website:
        company_description = website_extractor.complete_schema(fields.website)
        company_data.company_description = company_description.description
        company_data.activity.sectors = company_description.sectors
        company_data.activity.services = company_description.services
    return company_data.model_dump()


# Quick tests
if __name__ == "__main__":
    test_companies = [
        ScrapeCompanyDto(
            vat_number="0423369762", website=None
        ),  # Brico P. I.
        ScrapeCompanyDto(
            vat_number="1004905845", website=None
        ),  # Ada I. T.
        ScrapeCompanyDto(
            vat_number="0439340516", website=None
        ),  # ACA IT - SOLUTIONS * error address
        ScrapeCompanyDto(
            vat_number="0453914864", website=None
        ),  # Communication - GEAR
        ScrapeCompanyDto(
            vat_number="0439988337", website=None
        ),  # ALPHAA COMMUNICATION
        ScrapeCompanyDto(
            vat_number="0416398630", website=None
        ),  # PETRA
        ScrapeCompanyDto(
            vat_number="0416205323", website=None
        ),  # Association DDLBTM
        ScrapeCompanyDto(
            vat_number="0750931042", website=None
        ),  # Utile Games
        ScrapeCompanyDto(
            vat_number="0684997172", website=None
        ),  # Genius Kids
        ScrapeCompanyDto(
            vat_number="0423768452", website=None
        ),  # A&P DECO
        ScrapeCompanyDto(
            vat_number="0403228109", website=None
        ),  # Arcofin
        ScrapeCompanyDto(
            vat_number="0831407784", website=None
        ),  # Makisu
        ScrapeCompanyDto(
            vat_number="0810307316", website=None
        ),  # Pain quotidien
        ScrapeCompanyDto(
            vat_number="0448540668", website="subalta.com"
        ),  # StartLAB
        ScrapeCompanyDto(
            vat_number="0435187629", website="https://www.epfc.eu"
        ),  # EPFC
    ]

    # Exécuter les tests
    # run(test_companies[0])  # Brico P. I.
    run(test_companies[1])  # Ada I. T.
    # run(test_companies[2])  # ACA IT - SOLUTIONS
    # run(test_companies[3])  # Communication - GEAR
    # run(test_companies[4])  # ALPHAA COMMUNICATION
    # run(test_companies[5])  # PETRA
    # run(test_companies[6])  # Association DDLBTM
    # run(test_companies[7])  # Utile Games
    # run(test_companies[8])  # Genius Kids
    # run(test_companies[9])  # A&P DECO
    # run(test_companies[10])  # Arcofin
    # run(test_companies[11])  # Makisu
    # run(test_companies[12])  # Pain quotidien
    # run(test_companies[13])  # StartLAB
    # run(test_companies[14])
