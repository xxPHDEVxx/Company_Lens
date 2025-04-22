from src.company_scraper.config.config import *
from src.company_scraper.tools.utils import *
from src.company_scraper.tools.scraper import CompanyScraper
import camelot, tempfile
from src.company_scraper.schema.data_process import *
scraper = CompanyScraper(WebBaseLoader)


# *********************************************
# ***** Financial data extraction methods *****
# *********************************************

def get_company_deposits(vat_number: str) -> dict:
    """
    Fetches published deposit data (annual bilan account) for a company from the National Bank of Belgium (NBB) API.

    :param vat_number: The VAT number of the company to fetch deposit data for.
    :return dict: A dictionary containing the published deposits for the company.
    """
    # Main request URL to fetch company data and get the deposit id
    try:
        # Make the request to obtain the ten last annual accounts
        content = scraper.run(URL.NBB_DEPOSITS_LIST.format(vat_number=vat_number))[0].page_content

        if not content: 
            return {}
        
        # Try to parse the content as JSON
        return json.loads(content)
    
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return {}

def get_last_year_deposits(published_deposits) -> list[dict]:
    """
    Retrieves deposits from the previous year from the given published deposits data.

    :param published_deposits: A dictionary containing a list of deposits under the key 'content'.
    :return: A list of dictionaries containing deposits from the last year, or an empty list if no deposits found.
    """
    # Use .get() to safely retrieve "content", which will return None if "content" doesn't exist
    last_year_deposits = {}
    content = published_deposits.get("content")
    
    if content:
        # Get the first deposit to determine the year of the last deposit
        last_deposit = content[0]  # first deposit
        # Extract the year from the 'periodEndDate' field of the first deposit
        last_year = datetime.strptime(last_deposit.get("periodEndDate"), '%Y-%m-%dT%H:%M:%SZ').year
        
        # Filter deposits
        last_year_deposits = [
            deposit for deposit in published_deposits['content']
            if datetime.strptime(deposit['periodEndDate'], '%Y-%m-%dT%H:%M:%SZ').year == last_year
        ]
    
    return last_year_deposits  # Return the filtered list of deposits for the last year



def extract_financial_from_deposit(published_deposits) -> dict:
    """
    Retrieves data from the last year deposit of the published deposits from the NBB.

    :param published_deposits: A dictionary containing a list of deposits under the key 'content'.
    :return: A dictionary with extracted data from the deposit's file (PDF or CSV).
    """
    # Retrieve deposits from the last year
    last_year_deposits = get_last_year_deposits(published_deposits)
    
    if not last_year_deposits:
        return {}

    # Iterate through the deposits and prioritize processing CSV files
    for deposit in last_year_deposits:
        if deposit["importFileType"] != "PDF":
            deposit_id = deposit.get("id")  # Get the deposit ID

            # Request and process the CSV content
            last_year_annual_account = scraper.run(URL.NBB_CSV_DEPOSIT.format(deposit_id = deposit_id))[0].page_content
            return load_csv_to_dict(last_year_annual_account)  # Load the CSV data into a dictionary

    # If the deposit's 'importFileType' is "PDF", process the PDF file
    if last_year_deposits[0].get("importFileType") == "PDF":
        return process_pdf_deposit(last_year_deposits[0])  # Process and extract data from the PDF file
        
    return {}


def get_financial_data(vat_number: str) -> AnnualAccountData:
    """
    Retrieves financial data for a given VAT number from the Belgian National Bank API.

    Returned financial data includes:
    - model (str): The annual account model used (e.g., full, abbreviated, micro).
    - employees (float): The number of employees in full-time equivalents.
    - previous_year_revenue (float): Revenue from the previous year.
    - total_asset (float): Total balance sheet assets, extracted from field "10/49".
    
    :param vat_number: The VAT number of the company.
    :return dict: A dictionary containing financial data (model, employees, year revenue, total asset).
    """
    deposits = get_company_deposits(vat_number) # list of deposit
    if not deposits: 
        logging.info("get_financial_data : Deposits list not found")
        return None

    data = extract_financial_from_deposit(deposits)

    # Extract necessary financial data
    annual_account_data = {
        "model": data.get("Model code", ""),  # Annual account model
        "employees": safe_float(data.get("1003", data.get("9087", 0))),  # UTA data
        "year_revenue": safe_float(data.get("70", 0)),  # Previous year's revenue
        "total_asset": safe_float(data.get("10/49", 0)),  # Total assets
        "gross_margin": safe_float(data.get("9900", ((safe_float(data.get("74", 0))
        + safe_float(data.get("70", 0)))
        - (safe_float(data.get("60", 0))
        + safe_float(data.get("61", 0))))))  # Total assets
    }

    return AnnualAccountData(**annual_account_data)

# *********************************
# ***** PDF Treatment methods *****
# *********************************

def process_pdf_deposit(deposit: dict) -> dict:
    """
    Extracts financial data from the PDF and returns it as a dictionary.

    This function fetches the PDF file using the deposit ID, saves it as a temporary file, 
    extracts relevant data from the file (based on compatibility codes) and returns the extracted data as a dictionary.

    :param deposit: A dictionary containing deposit information, including 'importFileType' and 'id'.
    :return: A dictionary containing the extracted data from the PDF, or an empty dictionary if no data is extracted.
    """
    data = {}
    
    # If the deposit's 'importFileType' is "PDF", fetch and process the PDF
    if deposit.get("importFileType") == "PDF":
        deposit_id = deposit.get("id")
        
        # Request the PDF file from the constructed URL
        last_year_annual_account = safe_request(URL.NBB_PDF_DEPOSIT.format(deposit_id = deposit_id), headers=get_random_header())        
        
        # If the request is successful (status code 200), process the PDF
        if last_year_annual_account.status_code == 200:
            # Save the PDF content as a temporary file to allow extraction
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf_file:
                temp_pdf_file.write(last_year_annual_account.content)  # Write PDF content to the file
                temp_pdf_path = temp_pdf_file.name  # Get the temporary file path
            
            try:
                # Find pages in the PDF that contain the word "codes"
                pages = find_pages_with_word(temp_pdf_path, "codes")
                # Extract the data from the identified pages and store it in 'data'
                data = load_pdf_to_dict(temp_pdf_path, pages)
            finally:
                # Clean up by removing the temporary PDF file
                os.remove(temp_pdf_path)

    return data  # Return the extracted data as a dictionary


def load_pdf_to_dict(pdf: str, pages: list) -> dict:
    """
    Extracts a dictionary {code: value} from a structured PDF containing financial tables,
    with debugging information at each step.

    :param pdf: Path to the PDF file.
    :param pages: List of page numbers to process.

    :return dict: A dictionary with codes as keys and numeric values as values.
    """
    code_value_dict = {}
    for page in pages:
        # Extract tables using Camelot in stream mode (mode for borderless tables)
        tables = camelot.read_pdf(pdf, pages=str(page), flavor="stream")

        for table in tables:
            df = table.df  # Convert the table into a pandas DataFrame

            # Find the row and column where 'codes' is located
            code_row_index, code_column_index = find_codes_column(df)

            if code_row_index is not None and len(df.columns) > (code_column_index + 1):  # Check if positions are valid

                # Extract code-value pairs from that table
                page_dict = extract_code_value_pairs(df, code_row_index, code_column_index)

                # Merge results into the final dictionary
                code_value_dict.update(page_dict)

    # Final dictionary returned after all pages are processed
    return code_value_dict

def find_codes_column(df) -> tuple[int, int]:
    """
    Find the row and column index of the cell containing the word 'codes'.
    
    :param df: The dataframe extracted from the PDF table.
    
    :return tuple: (row_index, column_index) if found, otherwise (None, None).
    """
    for row_index in range(len(df)):
        for col_index in range(len(df.columns)):
            if 'codes' in str(df.iloc[row_index, col_index]).lower():
                return row_index, col_index
    return None, None

def extract_code_value_pairs(df, code_row_index, code_column_index):
    """
    Extract code-value pairs from a dataframe starting at a given row index.
    
    :param df: The dataframe containing financial data.
    :param code_row_index: The row index where 'codes' was found.
    :param code_column_index: The column index where codes are located.
    
    :return dict: A dictionary with codes as keys and their corresponding values.
    """
    code_value_dict = {}
    for _, row in df.iloc[code_row_index + 1:].iterrows():  # Iterate over the rows starting from code_row_index + 1 (ignoring index "_")
        try:
            code = row[code_column_index].strip()  # Extract and clean the code from the designated column
            
            # Ensure the columns exist before trying to access them
            if code_column_index + 1 < len(row):  # Check if the next column exists
                value = row[code_column_index + 1].strip() if row[code_column_index + 1].strip() else None
            else:
                value = None
            
            # If no value in column +1, try column +2 if it exists (column could be moved)
            if not value and code_column_index + 2 < len(row):
                value = row[code_column_index + 2].strip()

            if code and value:
                code_value_dict[code] = value
        except IndexError:  # If there is an IndexError (out of range), skip that row
            continue
    return code_value_dict

# *********************************
# ***** Company size methods ******
# *********************************

def company_size_by_model(model_id: str) -> CompanySizeEnum:
    """
    Determines the company size based on the given annual account model ID.

    :param model_id: The identifier of the annual account model.

    :return str: The corresponding company size.
    """
    # Check if the model_id corresponds to a micro enterprise
    if model_id in Annual_account_model.MICRO:
        return CompanySizeEnum.micro
    # Check if the model_id corresponds to a small enterprise (abbreviated)
    elif model_id in Annual_account_model.ABBREVIATED:
        return CompanySizeEnum.small
    # Return None if the model_id does not match any known size category
    else:
        return None



def company_size_by_financial(
    employees: float, previous_year_revenue: float, total_assets: float
) -> CompanySizeEnum:
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
    if employees == 0 and previous_year_revenue == 0 and total_assets == 0:
        logging.info("company_size_by_financial : annual account data not found")
        return None

    # Divide by million for comparison
    revenue_millions = previous_year_revenue / 1_000_000
    assets_millions = total_assets / 1_000_000

    if employees < 10 and ((revenue_millions <= 2 and revenue_millions != 0) or (assets_millions <= 2 and assets_millions != 0)):
        return CompanySizeEnum.micro
    elif employees < 50 and ((revenue_millions <= 10 and revenue_millions != 0) or (assets_millions <= 10 and assets_millions != 0)):
        return CompanySizeEnum.small
    elif employees < 250 and ((revenue_millions <= 50 and revenue_millions != 0) or (assets_millions <= 43 and assets_millions != 0)):
        return CompanySizeEnum.medium
    else:
        return CompanySizeEnum.large


def determine_company_size(vat_number: str, financial_data: AnnualAccountData) -> CompanySizeEnum:
    """
    Determines the size of a company based on its financial data and model.

    :param vat_number: The VAT number of the company whose size is to be determined.
    :param financial_data: A dictionary containing the company's financial data (e.g., number of employees, revenue, assets, model).
    :return: The determined company size as an enumerated value of type CompanySizeEnum.
    """
    # Retrieve financial data for the given VAT number
    if not financial_data:
        # Log an error if no financial data is found
        logging.error(f"No financial data found for VAT number {vat_number}")
        return None

    uta = financial_data.employees  # Unité de travail annuel (UTA)
    revenue = financial_data.previous_year_revenue  # Previous year's revenue
    assets = financial_data.total_asset  # Total assets

    # Determine company size using the financial thresholds
    size = company_size_by_financial(uta, revenue, assets)

    # If the company size cannot be determined by financial data, use the model-based fallback
    if not size:
        model = financial_data.get("model")  # Get the annual account model
        size = company_size_by_model(model)  # Determine size based on the model

    if not size:
        logging.error(f"Company size could not be determined for VAT number {vat_number}")
        return None

    # Return the determined company size
    return size


# ************************
# ***** Final method *****
# ************************

def get_size_and_financial_data(vat_number: str) -> FinancialProcessData:
    """
    Retrieves the size and financial data of a company based on its VAT number.

    This function first fetches the financial data for the company using the provided VAT number. 
    If the financial data is found, it then determines the company size using the financial data. 
    If no financial data is available.

    :param vat_number: The VAT number of the company whose size and financial data are to be retrieved.
    :return: A tuple containing the company size and financial data.
    """
    # Check if a VAT number is provided
    if vat_number:
        # Fetch the financial data for the given VAT number
        financial_data = get_financial_data(vat_number)

        # If no financial data is found, return None
        if not financial_data:
            logging.info("get_size_and_financial_data : Annual account data not found")
            return None
        # Determine the company size based on the retrieved financial data
        size = determine_company_size(vat_number, financial_data)

    # Return the company size and financial data as a tuple
    return FinancialProcessData(size=size, annual_account=financial_data)
