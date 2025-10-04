from src.company_scraper.config.config import *
from src.company_scraper.tools.utils import *
from src.company_scraper.tools.format import *
import time, math
from concurrent.futures import ThreadPoolExecutor, as_completed

scraper = CompanyScraper(WebBaseLoader)

#*****************************************
#***** Establishment Units extraction *****
#*****************************************

def get_units_data(vat_number: str) -> EstablishmentUnitData:
    """
    Fetches the establishment units associated with a specific VAT number.
    Sends a request to the KBO (Belgium's business register) and processes the response.

    Args:
        vat_number (str): The VAT number (company number) for which to fetch the associated units.

    Returns:
        list: A list of EstablishmentUnit objects containing the parsed unit details.
    """
    # Runs the scraper to fetch the documents from the URL
    documents = scraper.run(URL.ESTABLISHMENTS_LIST.format(vat_number=vat_number))
    
    # Handles the documents to extract units and return them
    establishment_units_data = handle_units(documents)
    
    return establishment_units_data

def extract_address(text: str) -> str:
    """
    Extracts the address from the given text, excluding the "Depuis ..." part from the BCE units list.

    Args:
        text (str): The raw text containing the address, possibly including a "Depuis ..." part.

    Returns:
        str: The cleaned address without the "Depuis ..." part.
    """
    # Regular expression to remove the part starting with "Depuis"
    address = re.sub(r"Depuis.*", "", text).strip()  # Strips any leading or trailing spaces
    return address

def parse_etablissement_units(html) -> List[EstablishmentUnit]:
    """
    Parses the HTML page containing establishment units and extracts relevant details.
    Returns a list of EstablishmentUnit objects.

    Args:
        html (str): The raw HTML content of the KBO page containing establishment unit details.

    Returns:
        list: A list of EstablishmentUnit objects parsed from the HTML.
    """
    units = []
    soup = BeautifulSoup(html, "html.parser")

    # Find the table with the id 'vestiginglist' or fall back to the first table if not found
    table = soup.find("table", id="vestiginglist") or soup.find("table")
    if not table:
        logging.error("Empty establishment unit list, or the HTML structure of the KBO establishment unit list page might have changed.")
        return None

    # Find the <tbody> element inside the table
    tbody = table.find("tbody")
    if not tbody:
        logging.error("Table found but has no <tbody> element.")
        return None

    # Get all the rows in the table body
    rows = tbody.find_all("tr")
    for row in rows:
        cells = row.find_all("td")  # Extract the cells from the row
        if len(cells) >= 6:  # Ensure there are enough cells in the row (should be 6 columns in the kbo website)
            try:
                # Extract the establishment number from a <a> tag in the third column (cells[2])
                Establishment_number_tag = cells[2].find("a")
                Establishment_number = Establishment_number_tag.get_text(strip=True).replace('.', '').replace(' ', '') if Establishment_number_tag else ""

                # Create an EstablishmentUnit object from the parsed data
                unit = {
                    "statut": cells[1].get_text(strip=True),  # Status (e.g., active, inactive)
                    "establishment_number": Establishment_number,  # Establishment number (e.g., company number)
                    "date": cells[3].get_text(strip=True) or None,  # Date, or None if empty
                    "denomination": cells[4].get_text(strip=True),  # Name of the establishment
                    "address": extract_address(cells[5].get_text(" ", strip=True))  # Extract the address and clean it
                }
                units.append(unit)  # Add the unit to the list
            except Exception as e:
                logging.error(f"Error while parsing an establishment unit: {e}")

    return units

def handle_units(documents: List[Document]) -> EstablishmentUnitData:
    """
    Extract manually the units list from html into Documents if possible.
    Otherwise it return the html content without footer and header. 

    Args:
        documents (list[Document]): A list of Document objects containing HTML data.

    Returns:
        list: A list of EstablishmentUnit objects, parsed from the documents.
    """
    units_html = kbo_establishment_units_format(documents)
    units = parse_etablissement_units(units_html)

    if not units:
        return EstablishmentUnitData(html_content=units_html)
    return EstablishmentUnitData(units=units)