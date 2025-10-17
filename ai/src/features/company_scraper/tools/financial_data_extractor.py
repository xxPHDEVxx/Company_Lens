import csv
from io import BytesIO, StringIO
import json
import os

import PyPDF2
import camelot
from loguru import logger
import xml.etree.ElementTree as ET


from typing import Optional

from requests import HTTPError
from src.core.network.header_utils import HeaderUtils
from src.core.network.web_client import WebClient
from src.features.company_scraper.config.belgian_annual_account_models import (
    Annual_account_model,
)
from src.features.company_scraper.config.urls import URL
from src.features.company_scraper.schema.company_schema import CompanySizeEnum, FinancialSchema
from src.features.company_scraper.schema.data_process import AnnualAccountData
from src.features.company_scraper.schema.nbb_response_model import (
    NbbDepositModel,
    NbbDepositApiResponseModel,
)
from src.features.company_scraper.tools.utils import (
    safe_float,
)


class PdfFileManager:

    def search_page_with_word(self, binaries: BytesIO, word: str) -> list[int]:
        """
        Search for a specific word in a PDF file and return the pages where it is found.

        :param pdf_path: Path to the PDF file.
        :param word: The word to search for.
        :return: A list of page numbers where the word is found.
        """
        pages: list[int] = []
        reader = PyPDF2.PdfReader(binaries)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if word.lower() in text.lower():
                pages.append(i + 1)
        return pages

    def load_pages(self, binaries: BytesIO, pages: list[int]) -> dict:
        """
        Load specific pages from a PDF file and return their content as a dictionary.

        :param pdf_path: Path to the PDF file.
        :param pages: List of page numbers to load.
        :return: A dictionary with page numbers as keys and their content as values.
        """
        code_value_dict = {}
        for page in pages:
            # Extract tables using Camelot in stream mode (mode for borderless tables)
            tables = camelot.read_pdf(binaries, pages=str(page), flavor="stream")

            for table in tables:
                df = table.df  # Convert the table into a pandas DataFrame

                # Find the row and column where 'codes' is located
                code_row_index, code_column_index = find_codes_column(df)

                if code_row_index is not None and len(df.columns) > (
                    code_column_index + 1
                ):  # Check if positions are valid

                    # Extract code-value pairs from that table
                    page_dict = extract_code_value_pairs(
                        df, code_row_index, code_column_index
                    )

                    # Merge results into the final dictionary
                    code_value_dict.update(page_dict)

        # Final dictionary returned after all pages are processed
        return code_value_dict


class NbbFileManager:

    def __init__(self):
        self.__web_client = WebClient(headers=HeaderUtils.get_head_full_header())
        self.__pdf_file_manager = PdfFileManager()

    def __download_file(self, url: str) -> Optional[bytes]:
        return self.__web_client.get(url)

    def handle_file(self, file_type: str, deposit_id: str) -> dict:
        try:
            url = URL.NBB_CSV_DEPOSIT.format(deposit_id=deposit_id)
            data = self.__download_file(url)
            if data is not None:
                return self.__load_csv_to_dict(data.decode("utf-8"))
        except HTTPError:
            pass
        if file_type == "PDF":
            url = URL.NBB_PDF_DEPOSIT.format(deposit_id=deposit_id)
            file_content = self.__download_file(url)
            return self.__handle_pdf_file(file_content)
        elif file_type == "XBRL":
            url = URL.NBB_XBRL_DEPOSIT.format(deposit_id=deposit_id)
            file_content = self.__download_file(url)
            return self.__handle_xbrl_file(file_content)
        else:
            url = URL.NBB_CSV_DEPOSIT.format(deposit_id=deposit_id)
            file_content = self.__download_file(url)
            return self.__load_csv_to_dict(file_content.decode("utf-8"))

    def __handle_pdf_file(self, file_content: str) -> dict:

        binaries = BytesIO(file_content)
        page_number = self.__pdf_file_manager.search_page_with_word(binaries, "codes")
        data = self.__pdf_file_manager.load_pages(binaries, page_number)
        return data

    def __handle_xbrl_file(self, file_content: bytes) -> dict:
        """
        Handle XBRL file content and extract financial data.

        :param file_content: The content of the XBRL file as bytes.
        :return: A dictionary with the extracted financial data.
        """
        return XbrlFileManager(binaries=file_content).extract()

    def __load_csv_to_dict(self, file_content: str) -> dict:
        """
        Load CSV content into a dictionary.

        :param csv_content: The CSV content as a string.
        :return: A dictionary with the CSV data.
        """
        csv_content = StringIO(file_content)
        reader = csv.reader(csv_content)

        # Transform each row into key/value
        data = {row[0]: row[1] for row in reader if len(row) >= 2}

        return data


def find_codes_column(df) -> tuple[int, int]:
    """
    Find the row and column index of the cell containing the word 'codes'.

    :param df: The dataframe extracted from the PDF table.

    :return tuple: (row_index, column_index) if found, otherwise (None, None).
    """
    for row_index in range(len(df)):
        for col_index in range(len(df.columns)):
            if "codes" in str(df.iloc[row_index, col_index]).lower():
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
    for _, row in df.iloc[
        code_row_index + 1 :
    ].iterrows():  # Iterate over the rows starting from code_row_index + 1 (ignoring index "_")
        try:
            code = row[
                code_column_index
            ].strip()  # Extract and clean the code from the designated column

            # Ensure the columns exist before trying to access them
            if code_column_index + 1 < len(row):  # Check if the next column exists
                value = (
                    row[code_column_index + 1].strip()
                    if row[code_column_index + 1].strip()
                    else None
                )
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


class CompanySizeComputer:
    """
    A class to compute the size of a company based on its financial data.
    // TODO : Add the ASBL model computation
    """

    def __init__(self):
        pass

    def compute_size(self, annual_account_data: AnnualAccountData) -> CompanySizeEnum:
        """
        Wrapped around the different methods to compute the size of a company based on its financial data.

        Args:
            annual_account_data (AnnualAccountData): _description_

        Returns:
            CompanySizeEnum: _description_
        """
        size = self.__compute_by_annual_account_data(
            employees=annual_account_data.employees,
            previous_year_revenue=annual_account_data.previous_year_revenue,
            total_assets=annual_account_data.total_asset,
        )
        if size:
            return size
        size = self.__company_size_by_model(model_id=annual_account_data.model)
        if size:
            return size
        logger.error("Unable to determine company size.")
        return CompanySizeEnum.small

    def __compute_by_annual_account_data(
        self, employees: float, previous_year_revenue: float, total_assets: float
    ) -> CompanySizeEnum:
        
        if employees == 0 and previous_year_revenue == 0 and total_assets == 0:
            logger.info("company_size_by_financial : annual account data not found")
            return None
        
        revenue_millions = previous_year_revenue / 1_000_000
        assets_millions = total_assets / 1_000_000
        
        # Check from largest to smallest (top-down approach)
        
        # Large: ≥ 250 employés OU CA > 50M OU bilan > 43M
        if employees >= 250 or revenue_millions > 50 or assets_millions > 43:
            return CompanySizeEnum.large
        
        # Medium: < 250 employés ET CA ≤ 50M ET bilan ≤ 43M
        # (mais ne remplit pas les critères petite/micro)
        if employees < 250 and revenue_millions <= 50 and assets_millions <= 43:
            # Small: < 50 employés ET CA ≤ 10M ET bilan ≤ 10M
            if employees < 50 and revenue_millions <= 10 and assets_millions <= 10:
                # Micro: < 10 employés ET CA ≤ 2M ET bilan ≤ 2M
                if employees < 10 and revenue_millions <= 2 and assets_millions <= 2:
                    return CompanySizeEnum.micro
                return CompanySizeEnum.small
            return CompanySizeEnum.medium
        
        # Fallback
        return CompanySizeEnum.large

    def __company_size_by_model(
        self, model_id: Optional[str]
    ) -> Optional[CompanySizeEnum]:
        """
        Determines the company size based on the given annual account model ID.

        :param model_id: The identifier of the annual account model.

        :return str: The corresponding company size.
        """
        if not model_id:
            return None

        if model_id in Annual_account_model.MICRO:
            return CompanySizeEnum.micro
        if model_id in Annual_account_model.ABBREVIATED:
            return CompanySizeEnum.small
        return None


class XbrlFileManager:

    def __init__(self, binaries: bytes):
        self.__root = ET.fromstring(binaries.decode("utf-8"))
        self.__ns = {
            "xbrli": "http://www.xbrl.org/2003/instance",
            "pfs": "http://www.nbb.be/be/fr/pfs/ci/2021-01-01",
            "pfs-gcd": "http://www.nbb.be/be/fr/pfs/ci/gcd/2021-01-01",
            "pfs-vl": "http://www.nbb.be/be/fr/pfs/ci/vl/2021-01-01",
        }

    def extract(self) -> dict:
        return {
            "Model code": self.get_text(
                "pfs-vl:XCode_SchemaCode_73", context="PrecedingDuration"
            )
            or self.get_text("pfs-vl:XCode_SchemaCode_73", context="CurrentDuration"),
            "1003": self.get_text(
                "pfs:AverageNumberEmployeesPersonnelRegisterTotalFullTimeEquivalents",
                context="PrecedingDuration",
            ),
            "9087": self.get_text(
                "pfs:AverageNumberEmployeesPersonnelRegisterTotalFullTimeEquivalents",
                context="CurrentDuration",
            ),
            "70": self.get_text(
                "pfs:GrossOperatingMargin", context="PrecedingDuration"
            ),  # Replace with correct tag for revenue if needed
            "10/49": self.get_text("pfs:Assets", context="PrecedingInstant"),
            "9900": self.get_text("pfs:GrossOperatingMargin", context="PrecedingDuration"),
            "9903": self.get_text("pfs:ProfitLoss", context="PrecedingDuration"),  # Benefice
            "9904": None,  # TODO: Add XBRL tag for code 9904 if needed
            "9905": None,  # TODO: Add XBRL tag for code 9905 if needed
            "9906": None,  # TODO: Add XBRL tag for code 9906 if needed
            "74": None,  # Add extraction if needed
            "60": None,  # Add extraction if needed
            "61": None,  # Add extraction if needed
        }

    def safe_float(self, val):
        try:
            return float(val)
        except Exception:
            return 0.0

    def get_text(self, tag, context=None):
        for elem in self.__root.findall(f".//{tag}", self.__ns):
            if context is None or elem.attrib.get("contextRef") == context:
                return elem.text
        return None


class FinancialDataExtractor:
    """
    A class responsible for managing financial data extraction for a company based on its VAT number.
    """

    def __init__(self, vat_number: str):
        self.__vat_number = vat_number
        self.__nbb_file_manager = NbbFileManager()
        self.__web_client = WebClient(headers=HeaderUtils.get_head_full_header())

    def __get_company_deposits(self) -> Optional[NbbDepositApiResponseModel]:
        """
        Fetches published deposit data (annual bilan account) for a company from the National Bank of Belgium (NBB) API.

        :param vat_number:
        :return dict: A dictionary containing the published deposits for the company.
        """
        binaries = self.__web_client.get(
            URL.NBB_DEPOSITS_LIST.format(vat_number=self.__vat_number)
        )
        if binaries is None:
            logger.error(f"Failed to fetch data for VAT number: {self.__vat_number}")
            return None
        return NbbDepositApiResponseModel(**json.loads(binaries))

    def __get_last_n_deposits(
        self, nbb_response: NbbDepositApiResponseModel, n: int = 3
    ) -> Optional[list[NbbDepositModel]]:
        """
        Retrieves the last N deposits (most recent years) from the published deposits data.

        :param nbb_response: NBB API response containing all deposits
        :param n: Number of most recent deposits to retrieve (default: 3)
        :return: A list of the N most recent deposits, or None if no deposits found
        """
        if nbb_response.content and len(nbb_response.content) > 0:
            # Deposits are already sorted by date (most recent first)
            return nbb_response.content[:n]
        return None

    def __extract_financial_from_deposit(
        self, deposit: NbbDepositModel
    ) -> dict:
        """
        Extracts financial data from a single deposit file.

        :param deposit: Single NBB deposit model
        :return: Dictionary containing parsed financial codes and values
        """
        return self.__nbb_file_manager.handle_file(
            file_type=deposit.importFileType,
            deposit_id=deposit.id
        )

    def extract(self) -> list[FinancialSchema]:
        """
        Extract financial data for the last 3 years from NBB deposits.

        :return: List of FinancialSchema objects (one per year), or empty list if no data found
        """
        nbb_response = self.__get_company_deposits()
        last_n_deposits = self.__get_last_n_deposits(nbb_response, n=3)

        if last_n_deposits is None:
            logger.info("No deposits found for company")
            return []

        yearly_data = []

        for deposit in last_n_deposits:
            # Skip PDF files if other formats are available (PDFs are less reliable)
            if deposit.importFileType == "PDF":
                logger.info(f"Skipping PDF deposit for year {deposit.periodEndDate.year}")
                continue

            try:
                year = deposit.periodEndDate.year
                financial_data_dict = self.__extract_financial_from_deposit(deposit)

                # Extract benefice from codes 9903, 9904, 9905, 9906 (in priority order)
                benefice = safe_float(
                    financial_data_dict.get("9903") or
                    financial_data_dict.get("9904") or
                    financial_data_dict.get("9905") or
                    financial_data_dict.get("9906") or
                    0
                )

                # Create FinancialSchema with all available fields
                financial_schema = FinancialSchema(
                    year=year,
                    model=financial_data_dict.get("Model code", ""),
                    gross_margin=safe_float(
                        financial_data_dict.get(
                            "9900",
                            (
                                (
                                    safe_float(financial_data_dict.get("74", 0))
                                    + safe_float(financial_data_dict.get("70", 0))
                                )
                                - (
                                    safe_float(financial_data_dict.get("60", 0))
                                    + safe_float(financial_data_dict.get("61", 0))
                                )
                            ),
                        )
                    ),
                    revenue=safe_float(financial_data_dict.get("70", 0)),
                    total_assets=safe_float(financial_data_dict.get("10/49", 0)),
                    benefice=benefice,
                    number_of_employees=safe_float(
                        financial_data_dict.get("1003", financial_data_dict.get("9087", 0))
                    )
                )

                yearly_data.append(financial_schema)
                logger.info(f"Extracted financial data for year {year}")

            except Exception as e:
                logger.error(f"Failed to extract financial data for year {deposit.periodEndDate.year}: {e}")
                continue

        # If all deposits were PDFs or failed, try to process at least one PDF
        if not yearly_data and last_n_deposits:
            for deposit in last_n_deposits:
                if deposit.importFileType == "PDF":
                    try:
                        year = deposit.periodEndDate.year
                        financial_data_dict = self.__extract_financial_from_deposit(deposit)

                        # Extract benefice from codes 9903, 9904, 9905, 9906 (in priority order)
                        benefice = safe_float(
                            financial_data_dict.get("9903") or
                            financial_data_dict.get("9904") or
                            financial_data_dict.get("9905") or
                            financial_data_dict.get("9906") or
                            0
                        )

                        financial_schema = FinancialSchema(
                            year=year,
                            model=financial_data_dict.get("Model code", ""),
                            gross_margin=safe_float(financial_data_dict.get("9900", 0)),
                            revenue=safe_float(financial_data_dict.get("70", 0)),
                            total_assets=safe_float(financial_data_dict.get("10/49", 0)),
                            benefice=benefice,
                            number_of_employees=safe_float(
                                financial_data_dict.get("1003", financial_data_dict.get("9087", 0))
                            )
                        )

                        yearly_data.append(financial_schema)
                        logger.info(f"Extracted financial data from PDF for year {year}")
                        break  # Only try first PDF
                    except Exception as e:
                        logger.error(f"Failed to extract PDF data for year {deposit.periodEndDate.year}: {e}")
                        continue

        return yearly_data
