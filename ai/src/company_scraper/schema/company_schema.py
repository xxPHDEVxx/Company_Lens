from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum
import re

class CompanySizeEnum(str, Enum):
    individual = "individual"
    micro_enterprise = "micro"
    small = "small"
    medium = "medium"
    large = "large"


class AddressSchema(BaseModel):
    street: Optional[str] = Field("", description="Street name")
    street_number: Optional[str] = Field("", description="Street number")
    postal_box: Optional[str] = Field(
        "", description="Postal Box starting by 'Boite or Box' "
    )
    postal_code: Optional[str] = Field("", description="Postal code")
    city: Optional[str] = Field(
        "", description="City (City juste after the postal code)"
    )
    province: Optional[str] = Field("", description="Province")
    region: Optional[str] = Field("", description="Region")
    country: Optional[str] = Field("", description="Country")

    @property
    def full_address(self) -> str:
        return f"{self.street} {self.street_number}, {self.postal_code} {self.city}"


class ContactSchema(BaseModel):
    email: Optional[str] = Field("", description="Email address")
    phone: Optional[str] = Field("", description="Phone number")
    website: Optional[str] = Field("", description="Website URL")


class FinancialSchema(BaseModel):
    gross_margin: Optional[int] = Field(None, description="Gross margin of the company")
    number_of_employees: Optional[float] = Field(None, description="Number of employees")
    company_size: Optional[str] = Field(None, description="Size of the company")

    @field_validator("gross_margin", mode="before")
    @classmethod
    def clean_numbers(cls, value):
        if isinstance(value, str):
            return int(re.sub(r"[^\d]", "", value)) if value.strip() else None
        return value


class ActivitiesSchema(BaseModel):
    nacebel_codes: List[str] = Field(default_factory=list, description="NACEBEL codes")
    company_activities: List[str] = Field(
        default_factory=list, description="Activities of the company."
    )
    sectors: List[str] = Field(
        default_factory=list, description="Sectors of the company"
    )
    services: List[str] = Field(default_factory=list, description="Services offered")
    company_description: Optional [str] = Field(None, description="Company description")


class CompanySchema(BaseModel):
    name: str = Field("", description="Name of the company.")
    vat_number: str = Field("", description="VAT number of the company.")
    established: str = Field("", description="Establishment date of the company.")
    legal_form: str = Field("", description="Legal form of the company.")
    company_type: List[str] = Field(default_factory=list, description="Type of company.")
    is_company: Optional[bool] = Field(False, description="Indicates if the entity is a company.")

    address: AddressSchema = Field(..., description="Address of the company.")
    activities: ActivitiesSchema = Field(..., description="Company activities")
    financial: FinancialSchema = Field(..., description="Financial details")
    contact: ContactSchema = Field(..., description="Contact informations")

    @field_validator("vat_number", mode="before")
    @classmethod
    def format_vat_number(cls, value: str) -> str:
        """Removes dots from VAT number if they exist, keeping only digits."""
        if not value:
            return ""
        if isinstance(value, str):
            return re.sub(r"[^\d]", "", value.strip())
        return value

    @field_validator("name", "legal_form", mode="before")
    @classmethod
    def strip_company_fields(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value
