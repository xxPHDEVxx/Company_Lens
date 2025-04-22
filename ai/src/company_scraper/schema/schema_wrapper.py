from src.company_scraper.config.config import *
from pydantic import ValidationError

class CompanySchemaWrapper:
    """
    A wrapper class for handling raw company data before validation with Pydantic.
    It ensures data is cleaned and formatted correctly before being passed to the final schema.
    """

    def __init__(self):
        """
        Initializes the wrapper with an empty company data structure.
        """
        self.raw_data = {
            "title": "CompanyDescription",
            "description": "Extracts the company description and sectors based on its activities.",
            "type": "object",
            "properties": {        
                "name": {
                    "type": "string",
                    "description": "Name of the company."
                },
                "vat_number": {
                    "type": "string",
                    "description": "VAT number of the company."
                },
                "established": {
                    "type": "string",
                    "description": "Date when the company was established."
                },
                "legal_form": {
                    "type": "string",
                    "description": "Legal form of the company."
                },
                "company_description": {
                            "type": "string",
                            "description": "Short description of the company's business operations."
                        },
                "company_size": {
                            "type": "string",
                            "description": "Size of the company."
                        },
                "company_type": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "private-company",
                            "public-company",
                            "self-employed",
                            "for-profit",
                            "non-profit",
                            "educational-institution",
                            "research-organization",
                            "startup"
                        ]
                    },
                    "description": "Type(s) of the company. Must be one or more of the following: private-company, public-company, self-employed, for-profit, non-profit, educational-institution, research-organization, startup."
                },
                "address": {
                    "type": "object",
                    "properties": {
                        "street": {
                            "type": "string",
                            "description": "Street name of the company's address."
                        },
                        "street_number": {
                            "type": "string",
                            "description": "Street number of the company's address."
                        },
                        "postal_box": {
                            "type": "string",
                            "description": "Postal box number (if applicable)."
                        },
                        "postal_code": {
                            "type": "string",
                            "description": "Postal code of the company's address."
                        },
                        "city": {
                            "type": "string",
                            "description": "City of the company's address."
                        },
                        "province": {
                            "type": "string",
                            "description": "Province (if applicable)."
                        },
                        "region": {
                            "type": "string",
                            "description": "Region of the company's address (if applicable)."
                        },
                        "country": {
                            "type": "string",
                            "description": "Country of the company's address."
                        },
                        "full_address": {
                            "type": "string",
                            "description": "street + street_number , + postal_code + city"
                        }

                    }
                },
                "activity": {
                    "type": "object",
                    "properties": {
                        "nacebel_codes": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "List of NACEBEL codes relevant to the company's activities."
                        },
                        "company_activities": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "List of main activities the company is engaged in."
                        },
                        "sectors": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Sectors the company operates in."
                        },
                        "services": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Services provided by the company."
                        },
                    }
                },
                "finance": {
                    "type": "object",
                    "properties": {
                        "gross_margin": {
                            "type": "number",
                            "description": "Gross margin of the company."
                        },
                        "number_of_employees": {
                            "type": "number",
                            "description": "Number of employees working in the company."
                        }
                    }
                },
                "contact": {
                    "type": "object",
                    "properties": {
                        "email": {
                            "type": "string",
                            "description": "Company email address."
                        },
                        "phone": {
                            "type": "string",
                            "description": "Company phone number."
                        },
                        "website": {
                            "type": "string",
                            "description": "Company website URL."
                        }
                    }
                },
                "establishment_units": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "statut": {
                                "type": "string",
                                "description": "Status of the establishment unit."
                            },
                            "establishment_number": {
                                "type": "string",
                                "description": "Establishment unit number."
                            },
                            "date": {
                                "type": "string",
                                "description": "Date of establishment."
                            },
                            "denomination": {
                                "type": "string",
                                "description": "Denomination of the establishment unit."
                            },
                            "address": {
                                "type": "string",
                                "description": "Address of the establishment unit."
                            }
                        }
                    },
                    "description": "List of establishment units the company has."
                }
            },
            "required": ["name", "vat_number", "address"]
        }



    def get_cleaned_data(self) -> dict:
        """
        Cleans raw data before validation with Pydantic.
        Returns:
            dict: A dictionary containing cleaned and validated company data.
        """
        return {
            "name": self.clean_string(self.raw_data.get("name")),
            "vat_number": self.clean_vat_number(self.raw_data.get("vat_number")),
            "established": self.clean_string(self.raw_data.get("established")),
            "legal_form": self.clean_string(self.raw_data.get("legal_form")),
            "company_description": self.clean_string(self.raw_data.get("company_description")),
            "company_size": self.clean_string(self.raw_data.get("company_size")),
            "company_type": self.raw_data.get("company_type"),
            "address": self.clean_address(self.raw_data.get("address")),
            "activity": self.clean_activity(self.raw_data.get("activity", None)),
            "finance": self.clean_finance(self.raw_data.get("finance", None)),
            "contact": self.clean_contact(self.raw_data.get("contact", None)),
            "establishment_units": self.clean_establishment_units(self.raw_data.get("establishment_units", None))
        }

    @staticmethod
    def clean_string(value: str) -> str:
        """
        Cleans a string by trimming spaces and ensuring it is a valid string.
        Args:
            value (str): The string to clean.
        Returns:
            str: The cleaned string.
        """
        if not isinstance(value, str) or value == "":
            return None
        return value.strip()

    @staticmethod
    def clean_vat_number(value: str) -> str:
        """
        Formats the VAT number by removing all non-numeric characters.
        Args:
            value (str): The VAT number to clean.
        Returns:
            str: The cleaned VAT number.
        """
        if not isinstance(value, str):
            return ""
        return "".join(filter(str.isdigit, value))

    @staticmethod
    def clean_address(address: AddressSchema) -> AddressSchema:
        """
        Cleans the address fields by ensuring each value is a properly formatted string.
        Args:
            address (dict): The raw address dictionary.
        Returns:
            dict: The cleaned address dictionary.
        """
        return {
            "street": CompanySchemaWrapper.clean_string(address.get("street")),
            "street_number": CompanySchemaWrapper.clean_string(address.get("street_number")),
            "postal_box": CompanySchemaWrapper.clean_string(address.get("postal_box")),
            "postal_code": CompanySchemaWrapper.clean_string(address.get("postal_code")),
            "city": CompanySchemaWrapper.clean_string(address.get("city")),
            "province": CompanySchemaWrapper.clean_string(address.get("province")),
            "region": CompanySchemaWrapper.clean_string(address.get("region")),
            "country": CompanySchemaWrapper.clean_string(address.get("country")),
        }

    @staticmethod
    def clean_contact(contact: dict) -> dict:
        """
        Cleans the contact details (email, phone, website).
        Args:
            contact (dict): The raw contact dictionary.
        Returns:
            dict: The cleaned contact dictionary.
        """
        return {
            "email": CompanySchemaWrapper.validate_email(contact.get("email")),
            "phone": CompanySchemaWrapper.validate_phone(contact.get("phone")),
            "website": CompanySchemaWrapper.clean_string(contact.get("website"))
        }

    @staticmethod
    def validate_email(value: str) -> str:
        """
        Validates and cleans an email address.
        Args:
            value (str): The email to validate.
        Returns:
            str: The cleaned email if valid, otherwise an empty string.
        """
        if not value:
            return ""
        if not isinstance(value, str) or not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            logging.error(f"Invalid email format: {value}")
            return ""
        return value.strip()

    @staticmethod
    def validate_phone(value: str) -> str:
        """
        Validates and cleans a phone number.
        Args:
            value (str): The phone number to validate.
        Returns:
            str: The cleaned phone number if valid, otherwise an empty string.
        """
        if not isinstance(value, str) or not re.match(r"^\+?[0-9\s\-\(\)]*$", value):
            logging.error(f"Invalid phone number format: {value}")
            return ""
        return value.strip()

    @staticmethod
    def clean_finance(finance: dict) -> dict:
        """
        Cleans financial data fields.
        Args:
            financial (dict): The raw financial data.
        Returns:
            dict: The cleaned financial data.
        """
        return {
            "gross_margin": CompanySchemaWrapper.clean_number(finance.get("gross_margin")),
            "number_of_employees": CompanySchemaWrapper.clean_number(finance.get("number_of_employees"))
        }

    @staticmethod
    def clean_number(value) -> int:
        """
        Converts a number stored as a string into a properly formatted integer.
        Args:
            value (str or int): The raw number.
        Returns:
            int: The cleaned number or None if invalid.
        """
        if isinstance(value, str):
            return int(re.sub(r"[^\d]", "", value)) if value.strip() else None
        return value

    @staticmethod
    def clean_activity(activity: dict) -> dict:
        """
        Cleans the company activity data.
        Args:
            activity (dict): The raw activity data.
        Returns:
            dict: The cleaned activity data.
        """
        return {
            "nacebel_codes": activity.get("nacebel_codes"),
            "company_activities": activity.get("company_activities"),
            "sectors": activity.get("sectors"),
            "services": activity.get("services")
        }

    @staticmethod
    def clean_establishment_units(etabs: list) -> list:
        """
        Cleans the list of establishment units.
        Args:
            etabs (list): The raw list of establishments.
        Returns:
            list: A list of cleaned establishment dictionaries.
        """
        cleaned_etabs = []
        for etab in etabs:
            etab = etab.dict()
            if isinstance(etab, dict):
                cleaned_etabs.append({
                    "statut": CompanySchemaWrapper.clean_string(etab.get("statut", "")),
                    "establishment_number": CompanySchemaWrapper.validate_establishment_number(etab.get("establishment_number", "")),
                    "date": CompanySchemaWrapper.clean_string(etab.get("date", "")),
                    "denomination": CompanySchemaWrapper.clean_string(etab.get("denomination", "")),
                    "address": CompanySchemaWrapper.clean_string(etab.get("address", "")),
                })
        return cleaned_etabs

    @staticmethod
    def validate_establishment_number(value: str) -> str:
        """
        Validates the format of an establishment number.
        Args:
            value (str): The establishment number.
        Returns:
            str: The cleaned establishment number if valid, otherwise an empty string.
        """
        pattern = r"^\d{1,3}(\d{3}){2,3}$"
        if not isinstance(value, str) or not re.match(pattern, value):
            logging.error(f"Invalid establishment_number format: {value}")
            return ""
        return value.strip()

    def to_company_schema(self) -> CompanySchema:
        """
        Transforms the cleaned data into a `CompanySchema` model.
        Returns:
            CompanySchema: A validated Pydantic model of the company data.
        """
        try:
            cleaned_data = self.get_cleaned_data()
            return CompanySchema(**cleaned_data)
        except ValidationError as e:
            logging.error(f"Validation error in CompanySchema: {e}")
            return None
