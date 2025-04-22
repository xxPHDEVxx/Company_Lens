from pydantic import BaseModel, Field
from typing import List, Optional, Any
from src.company_scraper.schema.company_schema import *

# ***** Finance *****

class AnnualAccountData(BaseModel):
    """
    Schema for encapsulating Annual Account data of a company retrieved using its VAT number.
    """
    model: Optional[str] = Field(
        None,
        description="The annual account model used by the company (e.g., full, abbreviated, micro)."
    )
    employees: Optional[float] = Field(
        0,
        description="The number of employees in full-time equivalents (FTE)."
    )
    previous_year_revenue: Optional[float] = Field(
        0,
        description="Revenue from the previous year."
    )
    total_asset: Optional[float] = Field(
        0,
        description="The total balance sheet assets, extracted from field '10/49'."
    )
    gross_margin: Optional[float] = Field(
        0,
        description="The gross margin of the company, calculated using total assets and revenue data."
    )

class FinancialProcessData(BaseModel):
    """
    Schema for encapsulating the result of company size and financial data retrieval.
    """
    size: Optional[CompanySizeEnum] = Field(
        None,
        description="The size category of the company, such as 'micro', 'small', 'medium', or 'large' if determined."
    )
    annual_account: Optional[AnnualAccountData] = Field(
        None,
        description="Detailed financial data of the company, including revenue, net income, assets, and liabilities."
    )

# ***** establishment_unit *****

class EstablishmentUnitData(BaseModel):
    """
    Data model representing the result of the establishment units extraction process.

    Attributes:
        units (Optional[List[EstablishmentUnit]]): 
            A list of extracted establishment units if the parsing was successful.
            
        html_content (Optional[str]): 
            Raw HTML content (excluding header and footer) to be used as input for a language model 
            in case the establishment units could not be parsed automatically.
    """
    units: Optional[List[EstablishmentUnit]] = Field(
        None, description="Extracted list of establishment units if parsing succeeds."
    )
    html_content: Optional[str] = Field(
        None, description="HTML content for LLM use if unit parsing fails."
    )


class LegalDataProcess(BaseModel):
    """
    Data model for storing the results of the parallel execution process.

    This schema groups the outputs of the parallel execution of:
    - complete_financial
    - complete_general_information
    - complete_establishment_units

    It contains the financial data, the list of establishment units, 
    and the concatenated string (llm_content) built from general information 
    and establishment units textual data.
    """

    financial_data_and_size: Optional[dict] = Field(
        None,
        description="Financial data and company size returned by complete_financial, or None if unavailable."
    )
    establishment_units_list: Optional [List[EstablishmentUnit]] = Field(
        default_factory=list,
        description="List of establishment units returned by complete_establishment_units. Empty if not a list."
    )
    llm_content: Optional[str] = Field(
        None,
        description="Concatenated string built from general information and establishment units text parts, "
                    "used as input for the LLM."
    )
