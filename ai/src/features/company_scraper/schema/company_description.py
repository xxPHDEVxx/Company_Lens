from typing import List
from pydantic import BaseModel, Field


class CompanyDescription(BaseModel):
    """
    Schema for encapsulating the company description and sectors based on its activities.

    Args:
        BaseModel (_type_): _description_
    """
    description: str = Field(description="Detailed description of the company.")
    sectors: List[str] = Field(description="List of sectors inferred from company activities.")
    services: List[str] = Field(description="List of services offered by the company.")
