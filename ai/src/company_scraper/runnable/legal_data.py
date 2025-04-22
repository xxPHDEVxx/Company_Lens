from src.company_scraper.tools.financial_data_extractor import *
from src.company_scraper.tools.establishment_units_extractor import *
from src.company_scraper.tools.general_information_extractor import *
from src.company_scraper.tools.format import *
from src.company_scraper.config.config import *
from concurrent.futures import ThreadPoolExecutor


class CompanyDataExtractor:
    """
    A class responsible for extracting company data based on a given VAT number.
    It retrieves financial data, address details, and relevant web content.
    """

    def __init__(self, vat_number: str):
        """
        Initializes the company data extractor with the provided VAT number.

        :param vat_number: VAT number of the company (as a string).
        """
        if not vat_number:
            raise ValueError("VAT number cannot be empty.")

        if not isinstance(vat_number, str):
            raise TypeError("VAT number must be a string.")

        vat_number = vat_number.strip()

        if not re.match(r"^\d{10}$", vat_number):
            raise ValueError("VAT number must be a 10-digit number.")

        self.vat_number = vat_number
        self.company_schema = CompanySchemaWrapper()

    def complete_full_address(self):
        addr = self.company_schema.raw_data.get("address", {})
        if all(addr.get(k) for k in ("street", "street_number", "postal_code", "city")):
            addr["full_address"] = (
                f"{addr['street']} {addr['street_number']}, {addr['postal_code']} {addr['city']}"
            )

    def complete_address(self):
        """
        Fills in missing address details by retrieving additional data from an external source.
        """
        try:
            address_schema = self.company_schema.raw_data.get("address", {})
            if not address_schema:
                logging.warning("No address schema found in raw_data.")
                return

            self.complete_full_address()
            full_address = address_schema.get("full_address")
            if not full_address:
                logging.warning("No full_address found in address schema.")
                return

            address_data = get_data_from_address(full_address) or {}
            address_schema["country"] = address_data.get("country", "")
            address_schema["province"] = address_data.get("province", "")

            postal_code = address_schema.get("postal_code")
            if postal_code:
                region = find_region(postal_code)
                if region:
                    address_schema["region"] = region
                else:
                    logging.info(f"No region found for postal code: {postal_code}")
            else:
                logging.warning("No postal_code provided in address schema.")

        except Exception as e:
            logging.error(f"Error in complete_address: {e}", exc_info=True)

    def complete_financial_and_size(self) -> dict:
        """
        Fetches financial data for the company.

        :return: A FinancialSchema object with extracted data.
        """
        financial_process_data = get_size_and_financial_data(self.vat_number)
        annual_account = financial_process_data.annual_account
        return {
            "size": financial_process_data.size,
            "financial_data": {
                "number_of_employees": int(annual_account.employees),
                "gross_margin": int(annual_account.gross_margin),
            },
        }

    def complete_establishment_units(self) -> EstablishmentUnitData:
        """
        Retrieves the list of establishment units.

        :return: List of establishment units or the html for the llm.
        """
        establishment_units_data = get_units_data(self.vat_number)
        return establishment_units_data

    # Return entity informations in markdown format for the LLM
    def complete_general_information(self):
        return get_entity_information(self.vat_number)

    def complete_schema(self, financial_and_size, units):
        self.complete_address()

        if financial_and_size:
            self.company_schema.raw_data["finance"] = financial_and_size[
                "financial_data"
            ]
            self.company_schema.raw_data["company_size"] = financial_and_size["size"]
        if units:
            self.company_schema.raw_data["establishment_units"] = units

    def parallel_execution(self) -> LegalDataProcess:
        """
        Executes financial, general information, and establishment units methods in parallel.

        Runs the three methods concurrently using ThreadPoolExecutor, handles exceptions and timeouts,
        and processes the results. Returns:
        - Financial data (or None),
        - Establishment units as a list,
        - Concatenated string (`llm_content`) from general info and establishment units (text parts).

        :return: LegalDataProcess schema
        """
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Define tasks and submit them
            tasks = {
                "financial_data_and_size": executor.submit(
                    self.complete_financial_and_size
                ),
                "general_info": executor.submit(self.complete_general_information),
                "establishment_units": executor.submit(
                    self.complete_establishment_units
                ),
            }
            # Collect results with error handling
            results = {}
            for name, future in tasks.items():
                try:
                    results[name] = future.result(timeout=30)
                except Exception as e:
                    results[name] = (
                        None if name == "financial_data" else f"Error in {name}: {e}"
                    )

        # Extract individual results
        financial_data_and_size = results["financial_data_and_size"]
        general_info = results["general_info"]
        establishment_units = EstablishmentUnitData.model_validate(
            results["establishment_units"]
        )

        # Prepare LLM content from text parts
        llm_parts = [
            part
            for part in [general_info, establishment_units.html_content]
            if isinstance(part, str) and part.strip()
        ]
        llm_content = "\n---\n".join(llm_parts) if llm_parts else None

        return LegalDataProcess(
            financial_data_and_size=financial_data_and_size,
            establishment_units_list=establishment_units.units,
            llm_content=llm_content,
        )

    @traceable
    def extract_company_data(self, scraped_content: str):
        """
        Extracts structured company data from raw web content using an LLM model.

        :param scraped_content: The raw textual content extracted from the web.
        """
        model = LLM.GPT_4O_MINI.with_structured_output(self.company_schema.raw_data)
        chain = Prompt.EXTRACT_LEGAL_DATA | model
        self.company_schema.raw_data = chain.invoke(
            {"input": scraped_content}
        )  # get the dict for the wrapper

    @traceable
    def get_company_schema(self) -> CompanySchema:
        """
        Orchestrates the entire process to retrieve and process company data.

        :return: A structured CompanySchema object if data is successfully extracted, otherwise None.
        """
        legal_data_process = self.parallel_execution()
        if legal_data_process.llm_content:
            self.extract_company_data(legal_data_process.llm_content)

        # Complete missing details
        self.complete_schema(
            legal_data_process.financial_data_and_size,
            legal_data_process.establishment_units_list,
        )

        return self.company_schema
