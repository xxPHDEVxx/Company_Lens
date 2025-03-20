from .scraper import CompanyScraper
from langchain_community.document_loaders import AsyncHtmlLoader
from difflib import SequenceMatcher
from config.config import *
import csv
from io import StringIO

scraper = CompanyScraper(AsyncHtmlLoader)

def safe_execution(func):
    """Decorator to handle errors globally"""

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            return None

    return wrapper


# **********************************
# ***** Address utils' methods *****
# **********************************

def find_region(postal) -> str:
    """
    Finds the region of Belgium based on the postal code.

    :param postal: an integer representing postal code.
    :return str: The region of the postal code.
    """
    postal = int(postal)

    if 1000 > postal or postal > 9992:
        return "" # If not a postal code
    if 1000 <= postal < 1300:
        return "Bruxelles"
    elif 1500 <= postal < 4000 or 8000 <= postal <= 9992:
        return "Flandre"
    return "Wallonie"


def get_data_from_address(address: str) -> dict:
    """
    Uses the OpenStreetMap API to retrieve country, province, and region from an address.
    """
    logging.error(address)
    try:
        # Encode the address for a safe URL
        address_encoded = urllib.parse.quote_plus(address)
        url = f"https://nominatim.openstreetmap.org/search?q={address_encoded}&format=json&addressdetails=1"

        # Initialize the scraper
        scraper = CompanyScraper(AsyncHtmlLoader)
        response = scraper.run(url)

        # Ensure response contains valid JSON
        try:
            data = json.loads(response[0].page_content)
        except json.JSONDecodeError:
            logging.error("error: Invalid JSON response from API")
            return
        logging.error(data)
        # Validate extracted data
        if isinstance(data, list) and data and "address" in data[0]:
            address_info = data[0]["address"]
            return {
                "country": address_info.get("country", ""),
                "province": address_info.get("state", ""),
                "region": address_info.get("region", ""),
            }
        logging.error("error get_data_from_address: Address not found or invalid format")
        return

    except Exception as e:
        logging.error("error: " + str(e))
        return

# *******************************************
# ***** Find company url utils' methods *****
# *******************************************

def compare_name_with_domain(company_name, url) -> float:
    """
    Compare company name and url domain.

    :param company_name: company name.
    :param url: url of the website.

    :return float: Score de correspondance entre 0 et 100.
    """
    if not company_name or not url:
        return 0

    try:
        domain = urlparse(url).netloc
        domain = domain.replace("www.", "").split(".")[0]
        company_name_clean = (
            company_name.lower()
            .replace(" ", "")
            .translate(str.maketrans("", "", string.punctuation))
        )

        # string similarity calcul
        return SequenceMatcher(None, company_name_clean, domain).ratio() * 100  # %

    except Exception as e:
        logging.error(f"Erreur : {e}")
        return 0

# **********************************************************
# ***** Financial data and company size utils' methods *****
# **********************************************************

def load_csv_to_dict(text):
    csv_content = StringIO(text)
    reader = csv.reader(csv_content)

    # Transform each row into key/value
    data = {row[0]: row[1] for row in reader if len(row) >= 2}

    return data


def safe_float(value):
    try:
        return (
            float(value.replace(",", ".")) if isinstance(value, str) else float(value)
        )
    except (ValueError, TypeError):
        return 0


def get_deposit_id(published_deposit):
    """
    This function retrieves the deposit ID of the first deposit where the 'importFileType' is not "PDF".

    :param published_deposit: A dictionary containing a list of deposits under the key 'content'.
    :return str or None: The deposit ID of the first deposit with 'importFileType' not equal to "PDF",
                          or None if no such deposit is found.
    """
    # Use .get() to safely retrieve "content", which will return None if "content" doesn't exist
    content = published_deposit.get("content")

    # Ensure that "content" exists and is a list before iterating
    if content:
        for deposit in content:
            # Check if "importFileType" is different from "PDF"
            if deposit.get("importFileType") != "PDF":
                # Return the ID of the first deposit found with "importFileType" different from "PDF"
                return deposit.get("id")

    # If no deposit has "importFileType" different from "PDF", return None
    return None


def get_financial_data(vat_number: str) -> dict:
    """
    Retrieves financial data for a given VAT number from the Belgian National Bank API.

    Returned financial data includes:
    - model (str): The annual account model used (e.g., full, abbreviated, micro).
    - employees (float): The number of employees in full-time equivalents.
    - previous_year_revenue (float): Revenue from the previous year.
    - total_asset (float): Total balance sheet assets, extracted from field "10/49".
    
    :param vat_number: The VAT number of the company.

    :return dict: A dictionary containing financial data (model, employees, previous_year_revenue, total_asset).
    """
    # Main request URL to fetch company data and get the deposit id
    url = f"https://consult.cbso.nbb.be/api/rs-consult/published-deposits?page=0&size=10&enterpriseNumber={vat_number}&sort=periodEndDate,desc&sort=depositDate,desc"
    print(url)
    # Make the first request to obtain the ID of the last annual account
    content = scraper.run(url)[0].page_content

    # Extract the ID of the last annual account
    response = json.loads(content)

    deposit_id = get_deposit_id(response)
    if not deposit_id:
        return None

    # Make a request to retrieve the CSV data for the annual account
    csv_url = f"https://consult.cbso.nbb.be/api/external/broker/public/deposits/consult/csv/{deposit_id}"
    last_year_annual_account = scraper.run(csv_url)[0].page_content
    # Load the CSV data and convert it into a dictionary
    data = load_csv_to_dict(last_year_annual_account)

    # Extract necessary financial data
    financial_data = {
        "model": data.get("Model code", ""),  # Annual account model
        "employees": safe_float(data.get("1003", data.get("9087", 0))),  # UTA data
        "year revenue": safe_float(data.get("70", 0)),  # Previous year's revenue
        "total asset": safe_float(data.get("10/49", 0)),  # Total assets
        "gross margin": (safe_float(data.get("74", 0))
        + safe_float(data.get("70", 0)))
        - (safe_float(data.get("60", 0))
        + safe_float(data.get("61", 0))),  # Total assets
    }
    return financial_data


def company_size_by_model(model_id: str) -> str:

    if model_id in Annual_account_model.MICRO:
        return CompanySizeEnum.micro_enterprise
    elif model_id in Annual_account_model.ABBREVIATED:
        return CompanySizeEnum.small
    else:
        return None


def company_size_by_financial(
    employees: float, previous_year_revenue: float, total_assets: float
) -> str:
    """
    Determines the company size based on the EU recommendation:
    https://economie-emploi.brussels/taille-entreprise

    Parameters:
    - employees (float): Number of employees (UTA - Unité de Travail Annuel).
    - previous_year_revenue (float): Annual revenue in euros (€), will be converted to millions of euros.
    - total_assets (float): Total balance sheet assets in euros (€), will be converted to millions of euros.

    Returns:
    - str: Company size ('micro_enterprise', 'small', 'medium', or 'large').
    """
    # If missing data return None
    if employees == 0 or (previous_year_revenue == 0 and total_assets == 0):
        return None

    # Divide by million for comparison
    revenue_millions = previous_year_revenue / 1_000_000
    assets_millions = total_assets / 1_000_000

    if employees < 10 and (revenue_millions <= 2 or assets_millions <= 2):
        return CompanySizeEnum.micro_enterprise
    elif employees < 50 and (revenue_millions <= 10 or assets_millions <= 10):
        return CompanySizeEnum.small
    elif employees < 250 and (revenue_millions <= 50 or assets_millions <= 43):
        return CompanySizeEnum.medium
    else:
        return CompanySizeEnum.large


def determine_company_size(vat_number: str, financial_data: dict) -> CompanySizeEnum:
    # Retrieve financial data for the given VAT number
    if not financial_data:
        # Raise an error if no financial data is found
        logging.error(f"No financial data found for VAT number {vat_number}")
        return None

    # Attempt to calculation based on financial indicators
    uta = financial_data.get("employees")  # Number of full-time equivalents (UTA)
    revenue = financial_data.get("year revenue")  # Previous year's revenue
    assets = financial_data.get("total asset")  # Total assets

    # Determine company size using financial thresholds
    size = company_size_by_financial(uta, revenue, assets)

    # fallback to determine company size based on the financial model provided
    if not size:
        model = financial_data.get("model")
        size = company_size_by_model(model)

    # If size still cannot be determined, raise an error
    if not size:
        logging.error(f"Company size could not be determined for VAT number {vat_number}")
        return None

    # Return the determined company size
    return size


def get_size_and_financial_data(vat_number: str) -> list:
    if vat_number:
        financial_data = get_financial_data(vat_number)
        if not financial_data:
            return None
        size = determine_company_size(vat_number, financial_data)
    return [size, financial_data]
