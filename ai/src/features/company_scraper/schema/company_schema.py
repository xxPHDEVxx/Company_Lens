from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from loguru import logger as logging
import re


class CompanySizeEnum(str, Enum):
    micro = "micro"
    small = "small"
    medium = "medium"
    large = "large"


class CompanyTypeEnum(str, Enum):
    PrivateCompany = "PrivateCompany"
    PublicCompany = "PublicCompany"
    SelfEmployed = "SelfEmployed"
    ForProfit = "ForProfit"
    NonProfit = "NonProfit"
    EducationalInstitution = "EducationalInstitution"
    ResearchOrganization = "ResearchOrganization"
    Startup = "Startup"
    Coorperative = "Cooperative"


class CompanyLocationEnum(str, Enum):
    flanders = "flanders"
    wallonia = "wallonia"
    brussels = "brussels"


class AddressSchema(BaseModel):
    street: str = Field(..., description="Street name")
    street_number: str = Field(..., description="Street number")
    postal_box: Optional[str] = Field(
        None, description="Postal Box starting by 'Boite or Box' "
    )
    postal_code: str = Field(..., description="Postal code")
    city: str = Field(..., description="City (City juste after the postal code)")
    province: Optional[str] = Field(None, description="Province")
    region: Optional[CompanyLocationEnum] = Field(..., description="Region")
    country: Optional[str] = Field(None, description="Country")

    @property
    def full_address(self) -> str:
        return f"{self.street} {self.street_number} {self.postal_code}" # format use for mapping between api result and kbo result (BCE)

    @field_validator("street", "street_number", "postal_code", "city", mode="before")
    @classmethod
    def strip_company_fields(cls, value):
        if not isinstance(value, str):
            logging.error("Address schema error : value not a string")
            return None
        return value.strip()


class ContactSchema(BaseModel):
    email: Optional[str] = Field("", description="Email address")
    phone: Optional[str] = Field("", description="Phone number")
    website: Optional[str] = Field("", description="Website URL")

    @field_validator("email", "phone", "website", mode="before")
    @classmethod
    def strip_company_fields(cls, value):
        if value is None:
            return None
        if not isinstance(value, str):
            return None
        return value.strip()

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if value and not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            logging.info("invalid email format")
            return None
        return value

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value):
        if value and not re.match(r"^\+?[0-9\s\-\(\)]*$", value):
            logging.info("invalid phone format")
            return None
        return value


class FinancialSchema(BaseModel):
    year: int = Field(description="Fiscal year for this financial data")
    model: Optional[str] = Field(None, description="Annual account model (micro, abbreviated, full)")
    gross_margin: Optional[float] = Field(None, description="Gross margin of the company")
    revenue: Optional[float] = Field(None, description="Revenue from this year")
    total_assets: Optional[float] = Field(None, description="Total balance sheet assets")
    benefice: Optional[float] = Field(None, description="Profit/benefit of the company (codes 9903-9906)")
    number_of_employees: Optional[float] = Field(
        None, description="Number of employees"
    )

    @field_validator("gross_margin", mode="before")
    @classmethod
    def clean_numbers(cls, value):
        if isinstance(value, str):
            return int(re.sub(r"[^\d]", "", value)) if value.strip() else None
        return value


class ActivitiesSchema(BaseModel):
    nacebel_codes: Optional[List[str]] = Field(
        description="NACEBEL codes"
    )
    company_activities: Optional[List[str]] = Field(
        description="Activities of the company. Ensure all activities are non-null and non-empty strings."
    )
    sectors: Optional[List[str]] = Field(
        description="Sectors of the company. Ensure all sectors are non-null and non-empty strings."
    )
    services: Optional[List[str]] = Field(
        description="Services offered. Ensure all services are non-null and non-empty strings."
    )

    @field_validator("nacebel_codes", "company_activities", "sectors", "services", mode="before")
    @classmethod
    def remove_none_in_list(cls, v):
        if v is None:
            return []
        return [item for item in v if isinstance(item, str) and item.strip()]


class EstablishmentUnit(BaseModel):
    statut: str = Field(..., description="Actif or Passif")
    establishment_number: str = Field(
        ...,
        description="number of the establishment unit with this patern : x.xxx.xxx.xxx",
    )
    date: str = Field(..., description="beginning date of the establishment unit ")
    denomination: str = Field(..., description="name of the establishment unit")
    establishment_address: Optional[AddressSchema] = Field(..., description="Enriched address of the unit.")

    @field_validator("statut", "establishment_number", "denomination", mode="before")
    @classmethod
    def strip_company_fields(cls, value):
        if not isinstance(value, str):
            logging.error("Establishment schema error : value not a string")
            return ""
        return value.strip()

    @field_validator("establishment_number", mode="before")
    @classmethod
    def validate_Establishment_number(cls, value):
        """
        Validates the format of the establishment number to match the pattern x.xxx.xxx.xxx
        If the value does not match the pattern, it is set to an empty string.
        """
        # Regular expression to match the pattern x.xxx.xxx.xxx (with digits only)
        value = str(value).replace(".", "")
        pattern = r"^\d{1,3}(\d{3}){2,3}$"

        if not re.match(pattern, value):
            logging.error(f"Invalid establishment_number format: {value}")
            return None
        return value


class GeneralCompanySchema(BaseModel):
    name: str = Field(..., description="Name of the company.")
    vat_number: str = Field(..., description="VAT number of the company.")
    established: str = Field(..., description="Establishment date of the company.")
    legal_form: str = Field(..., description="Legal form of the company.")
    company_description: Optional[str] = Field(None, description="Company description")
    company_size: Optional[CompanySizeEnum] = Field(
        None, description="Size of the company"
    )
    minimum_help_amount: int = Field(
        default=0, description="default minimum_help_amount"
    )
    company_type: List[CompanyTypeEnum] = Field(..., description="Type of company.")
    address: Optional[str] = Field(..., description="Address of the company.")
    activity: Optional[ActivitiesSchema] = Field(
        default_factory=None, description="Company activity"
    )
    contact: Optional[ContactSchema] = Field(
        default_factory=None, description="Contact informations"
    )
    @field_validator("vat_number", mode="before")
    @classmethod
    def format_vat_number(cls, value: str) -> str:
        """Removes dots from VAT number if they exist, keeping only digits."""
        if not value or value == "":
            return None
        if isinstance(value, str):
            return re.sub(r"[^\d]", "", value.strip())
        return value

    @field_validator("name", "legal_form", "established", mode="before")
    @classmethod
    def strip_company_fields(cls, value):
        if not isinstance(value, str):
            logging.error("General information CompanySchema error : value not a string")
            return None
        return value.strip()



class CompanySchema(GeneralCompanySchema):
    address: AddressSchema
    finance: Optional[List[FinancialSchema]] = Field(
        default_factory=None, description="Financial data for the last 3 years"
    )

    establishment_units: Optional[list[EstablishmentUnit]] = Field(
        default_factory=None, description="list of Establishment unit of the company"
    )

    @classmethod
    def create_empty_instance(cls):
        instance = cls.model_construct()

        for field_name, field in cls.model_fields.items():
            field_type = field.annotation

            if field_type == str:
                setattr(instance, field_name, "")
            elif field_type == int:
                setattr(instance, field_name, 0)
            elif field_type == AddressSchema:
                setattr(instance, field_name, AddressSchema(street="", street_number="", postal_code="", city="", region=CompanyLocationEnum.flanders))
            else:
                setattr(instance, field_name, None)

        return instance
