from src.company_scraper.runnable.legal_data import CompanyDataExtractor
from src.company_scraper.runnable.company_description import (
    CompanyWebsiteExtractor,
)
from src.company_scraper.config.config import *


@traceable
def run(fields: dict) -> CompanySchema:
    """
    Runs the company data extraction process.

    This function takes a dictionary containing company details, extracts legal and
    financial information using public data sources, and enriches it with additional
    information from the company's website.

    :param fields: A dictionary containing company information.
                       Must include the 'vat_number' key.

    :return dict: A structured schema containing extracted company data.
    """
    if not fields:
        logging.error("The provided fields dictionary is empty.")
        return

    if not isinstance(fields, dict):
        logging.error("The provided fields is not a dictionary.")
        return

    if "vat_number" not in fields:
        logging.error("VAT number is missing.")
        return

    try:
        # Initialize data extractors
        legal_extractor = CompanyDataExtractor(fields["vat_number"])
        # Retrieve company schema from legal sources
        company_data = legal_extractor.get_company_schema()

        website_extractor = CompanyWebsiteExtractor(company_data)

        # Enrich schema with additional website data
        if website_extractor.initialized:
            website_extractor.complete_schema()

        return company_data.to_company_schema()

    except Exception as e:
        # Log any unexpected error during the process
        logging.error(f"An error occurred during the extraction process: {e}")
        return


if __name__ == "__main__":
    fields = [
        {"vat_number": "0423369762"},
        {"vat_number": "1004905845"},
        {"vat_number": "0439340516"},
        {"vat_number": "0453914864"},
        {"vat_number": "0439988337"},
        {"vat_number": "0416398630"},
        {"vat_number": "0416205323"},
        {"vat_number": "0750931042"},
        {"vat_number": "0684997172"},
        {"vat_number": "0423768452"},
        {"vat_number": "0403228109"},
        {"vat_number": "0831407784"},
        {"vat_number": "0810307316"},
        {"vat_number": "0448540668"},
    ]

    # run(fields[0])  # Brico P. I.
    # run(fields[1])  # Ada I. T.
    # run(fields[2])  # ACA IT - SOLUTIONS
    # run(fields[3])  # Communication - GEAR -> validé si activité bien présente
    # run(fields[4])  # ALPHAA COMMUNICATION -> améliorer identification url
    # run(fields[5])  # PETRA
    # run(fields[6]) # Association pour la Défense des Droits de Locataires du Brussels International Trade Mart ... -> améliorer identification url
    # run(fields[7])  # Utile Games
    # run(fields[8])  # Genius Kids
    # run(fields[9])  # A&P DECO
    # run(fields[10])  # Arcofin
    # run(fields[11])  # Makisu
    # run(fields[12])  # Pain quotidien
    # run(fields[13])  # StartLAB
