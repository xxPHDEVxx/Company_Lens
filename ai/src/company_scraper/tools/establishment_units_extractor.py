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

#*******************************
#***** Batching d'adresses *****
#*******************************

def parse_address(addresses: list[str]) -> dict:
    """
    Sends a batch request to the Geoapify API and waits for the results.
    
    Args:
        addresses (list[str]): A list of address strings to be geocoded.
    
    Returns:
        dict: The results of the batch geocoding request, or an empty dictionary in case of an error.
    
    Documentation:
        Geoapify API Documentation: https://apidocs.geoapify.com/docs/geocoding/batch/
    """
    key = "1ddc1af1744d49398ea93f77a7ee685e"

    # Sending the batch request to the Geoapify API
    response = safe_request(URL.GEOAPIFY_API, headers=get_random_header(), json=addresses, params={'apiKey': key})
    
    # Check if the response is successful (status code 200 or 202)
    if response is None or response.status_code not in [200, 202]:
        logging.error(f"Batch request failed: {response.status_code if response else 'No response'}")
        return {}

    batch_data = response.json()
    status_url = batch_data.get('url', '') + "&format=json"  # URL to get the batch status

    start_time = time.time()  # Start time to calculate timeout
    timeout = len(addresses) / 2 + 5  # Set a maximum waiting time based on the number of addresses

    while True:
        try:
            # Request the batch status
            result_data = requests.get(status_url).json()

            # If the result is a list, the job is complete
            if isinstance(result_data, list):
                logging.info("Job completed successfully.")
                return result_data

            # If the job takes too long, log a timeout error
            if time.time() - start_time > timeout:
                logging.error("Timeout: The job took too long.")
                return {}

            # Log job progress and wait for 1 second before checking again
            logging.info("Job in progress, waiting 1 second...")
            time.sleep(1)

        except (requests.exceptions.JSONDecodeError, requests.exceptions.RequestException) as e:
            logging.error(f"Error retrieving results: {e}")
            return {}

def split_into_batches(addresses: list[str]) -> list:
    """
    Splits the list of addresses into sub-lists of a given batch size.
    
    Args:
        addresses (list[str]): A list of addresses to be divided into smaller batches.
    
    Returns:
        list[list[str]]: A list of sub-lists, each containing a portion of the original addresses.
    """
    addresses_count = len(addresses)
    
    # If the number of addresses is 5 or more, divide the list into batches with at least 1 address per batch.
    batch_size = math.ceil(addresses_count / 5) if addresses_count >= 5 else 1
    
    # Create sub-lists (batches) based on the batch size
    return [addresses[i:i + batch_size] for i in range(0, len(addresses), batch_size)]

def parse_addresses_parallel(addresses: list[str]) -> list:
    """
    Manages the parallel execution of batch geocoding requests for a list of addresses.
    
    Args:
        addresses (list[str]): A list of addresses to be geocoded in parallel.
    
    Returns:
        list[dict]: A list of results from the parallel batch requests.
    """
    # Split addresses into batches
    address_batches = split_into_batches(addresses)
    results = []

    # Execute up to 5 batches in parallel using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Submit each batch of addresses to the executor
        future_to_batch = {executor.submit(parse_address, batch): batch for batch in address_batches}

        # Wait for each batch to finish and collect the results
        for future in as_completed(future_to_batch):
            batch_result = future.result()
            if batch_result:
                results.append(batch_result)

    return results


# addresses = [
#     "Chaussée de Mons 1301 1070 Anderlecht Belgium",
#     "Rue d'Arlon 6780 Messancy Belgium",
#     "Kolvestraat 1 8000 Brugge Belgium",
#     "Avenue Louise 500 1050 Bruxelles Belgium",
#     "Rue de la Loi 100 1040 Bruxelles Belgium",
# ]
# start_time = time.time()
# logging.info(parse_addresses_parallel(addresses))
# end_time = time.time()

# print(f"Durée d'exécution : {end_time - start_time:.2f} secondes")