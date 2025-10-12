from typing import Optional
from src.core.factory.chat_model_factory import ChatModelFactory
from src.features.company_scraper.config.prompts import Prompt
from src.features.company_scraper.schema.company_schema import (
    GeneralCompanySchema,
    CompanySchema,
    CompanySizeEnum,
    EstablishmentUnit,
    FinancialSchema,
)
from src.features.company_scraper.schema.schema_wrapper import CompanySchemaWrapper
from src.features.company_scraper.schema.data_process import (
    AnnualAccountData,
    EstablishmentUnitData,
    LegalDataProcess,
)
from loguru import logger as logging
from src.features.company_scraper.tools.address_resolver import AddressResolver
from src.features.company_scraper.tools.financial_data_extractor import (
    CompanySizeComputer,
    FinancialDataExtractor,
)
from src.features.company_scraper.tools.establishment_units_extractor import (
    EstablishmentUnitExtractor,
)
from src.features.company_scraper.tools.general_information_extractor import (
    GeneralInformationExtractor,
)
from concurrent.futures import ThreadPoolExecutor
from src.features.company_scraper.tools.address_handler import AddressHandler
from langsmith import traceable


class LegalDataExtractor:
    """
    A class responsible for extracting company data based on a given VAT number.
    It retrieves financial data, address details, and relevant web content.
    """

    def __init__(self, vat_number: str, website: Optional[str] = None):
        """
        Initializes the company data extractor with the provided VAT number.

        :param vat_number: VAT number of the company (as a string).
        """
        self.vat_number = vat_number.strip()
        self.website = website.strip() if website else None
        self.company_schema = CompanySchemaWrapper()
        self.__address_resolver = AddressResolver([])

    def complete_address(self):
        """
        Fills in missing address details by retrieving additional data from an external source.
        """
        logging.info(f"Completing addresses for VAT number: {self.vat_number}")
        try:
            AddressHandler(self.company_schema.raw_data).match_and_update_addresses()
        except Exception as e:
            logging.error(f"Error in complete_address: {e}", exc_info=True)

    def complete_financial_and_size(self) -> Optional[AnnualAccountData]:
        """
        Fetches financial data for the company.

        :return: A FinancialSchema object with extracted data.
        """
        return FinancialDataExtractor(self.vat_number).extract()

    def complete_establishment_units(self) -> EstablishmentUnitData:
        """
        Retrieves the list of establishment units.

        :return: List of establishment units or the html for the llm.
        """
        return EstablishmentUnitExtractor(self.vat_number).extract()

    def complete_general_information(self) -> str:
        """
        Return company informations in markdown format for LLM processing.

        Returns:
            str: _description_
        """
        return GeneralInformationExtractor(self.vat_number).extract()

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
                    logging.error(f"Error in task '{name}': {e}")
                    results[name] = None

        # Extract individual results
        financial_data_and_size: AnnualAccountData | None = results.get(
            "financial_data_and_size"
        )
        general_info: str = results.get("general_info")
        establishment_units: EstablishmentUnitData = results.get("establishment_units")

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
    def extract_company_data(self, scraped_content: str) -> GeneralCompanySchema:
        """
        Extracts structured company data from raw web content using an LLM model.

        :param scraped_content: The raw textual content extracted from the web.
        """
        model = ChatModelFactory.create_factory().get_llm("company_scrapper")[0]
        model = model.with_structured_output(GeneralCompanySchema)

        chain = Prompt.EXTRACT_LEGAL_DATA | model
        return chain.invoke({"input": scraped_content})

    @traceable
    def get_company_schema(self) -> CompanySchema:
        """
        Orchestrates the entire process to retrieve and process company data.

        :return: A structured CompanySchema object if data is successfully extracted, otherwise None.
        """
        logging.info(f"Starting data extraction for VAT number: {self.vat_number}")
        legal_data_process = self.parallel_execution()
        general_information = self.extract_company_data(legal_data_process.llm_content)
        operating_hq_address = self.__address_resolver.resolve_single(
            general_information.address
        )

        # Stop scraping if address resolution failed
        if operating_hq_address is None:
            logging.error(f"Address resolution failed for VAT {self.vat_number}, aborting scraping")
            return None

        if legal_data_process.financial_data_and_size is not None:
            general_information.company_size = CompanySizeComputer().compute_size(
                legal_data_process.financial_data_and_size
            )
        else:
            general_information.company_size = CompanySizeEnum.micro
        establishment_units: list[EstablishmentUnit] = []
        for item in legal_data_process.establishment_units_list:
            establishment_units.append(
                EstablishmentUnit(
                    statut=item.statut,
                    date=item.date,
                    denomination=item.denomination,
                    establishment_number=item.establishment_number,
                    establishment_address=AddressResolver([]).resolve_single(
                        item.address
                    ),
                )
            )

        if len(establishment_units) == 0:
            logging.warning(
                f"No establishment units found for VAT number: {self.vat_number}"
            )
        return CompanySchema(
            name=general_information.name,
            vat_number=self.vat_number,
            established=general_information.established,
            legal_form=general_information.legal_form,
            company_description=general_information.company_description,
            company_size=general_information.company_size,
            minimum_help_amount=general_information.minimum_help_amount,
            company_type=general_information.company_type,
            address=operating_hq_address,
            activity=general_information.activity,
            contact=general_information.contact,
            finance=(
                FinancialSchema(
                    gross_margin=legal_data_process.financial_data_and_size.gross_margin,
                    number_of_employees=legal_data_process.financial_data_and_size.employees,
                )
                if legal_data_process.financial_data_and_size
                else None
            ),
            establishment_units=establishment_units,
        )
