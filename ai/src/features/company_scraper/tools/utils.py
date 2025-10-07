import csv, re, string, PyPDF2, requests
from urllib.parse import urlparse
from src.features.company_scraper.schema.company_schema import CompanyLocationEnum
from src.features.company_scraper.tools.scraper import CompanyScraper
from difflib import SequenceMatcher
from io import StringIO
from loguru import logger as logging

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
        return CompanyLocationEnum.brussels
    elif 1500 <= postal < 4000 or 8000 <= postal <= 9992:
        return CompanyLocationEnum.flanders
    return CompanyLocationEnum.wallonia


def get_full_address(address: dict) -> str:
    """
    Builds a full address string from the provided address components in the dictionary.
    The full address includes the street, street number, postal code, and city.
    """
    if all(address.get(k) for k in ("street", "street_number", "postal_code", "city")):
        return f"{address['street']} {address['street_number']} {address['postal_code']} {address['city']}"
    return None


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

def load_csv_to_dict(text) -> dict:
    csv_content = StringIO(text)
    reader = csv.reader(csv_content)

    # Transform each row into key/value
    data = {row[0]: row[1] for row in reader if len(row) >= 2}

    return data


def safe_float(value) -> float:
    """
    Converts a string or numeric value to a float, handling common formats used in european financial data.

    This function handles values with thousands separators (periods) and decimal separators (commas).
    It attempts to clean up the input string by removing periods used as thousand separators and replacing
    commas with periods for decimal separators. If the conversion fails (due to invalid data), it returns 0.

    Args:
        value: The value to be converted to a float.

    Returns:
        float: The converted float value, or 0 if the conversion fails.
    
    Examples:
        >>> safe_float("403.394.333")
        403394333.0
        
        >>> safe_float("1.234,56")
        1234.56
        
        >>> safe_float("invalid")
        0
    """
    try:
        if isinstance(value, str):
            # Replace commas used as decimal separators with periods
            value = value.replace(",", ".") 
            # Remove periods that are used as thousand separators, but only if followed by 3 digits
            value = re.sub(r"(?<=\d)\.(?=\d{3})", "", value)
        return float(value)
    except (ValueError, TypeError):
        return 0


def find_pages_with_word(pdf_path, word) -> list:
    """
    Search all pages of a PDF for a specific word.
    
    :param pdf_path: Path to the PDF file.
    :param word: Word to search for.
    
    :return list: List of page numbers where the word was found.
    """
    with open(pdf_path, 'rb') as file:  # Open the PDF in binary mode
        pdf = PyPDF2.PdfReader(file)  # Create a PDF reader object
        pages_with_word = []
        for page_num in range(len(pdf.pages)):
            page_text = pdf.pages[page_num].extract_text()
            if page_text and word.lower() in page_text.lower():  # Check if the word is in the page
                pages_with_word.append(page_num + 1)  # Add the page number (starting from 1) to the list
        return pages_with_word  # Return the list of matching pages

def safe_request(url, headers=None, params=None, json=None) -> requests.Response:
    """Make a safe request with optional headers, query parameters, and JSON body."""
    try:
        # Exécution de la requête GET ou POST avec JSON si fourni
        if json:
            response = requests.post(url, headers=headers, params=params, json=json)
        else:
            response = requests.get(url, headers=headers, params=params)
        
        response.raise_for_status()  # Vérifie si la requête a échoué
        return response
    except requests.RequestException as e:
        logging.error(f"Error with URL {url}: {e}")
        return None
