from typing import Optional
from pydantic import BaseModel


class RawEstablishmentUnit(BaseModel):
    statut: str
    establishment_number: str
    date: Optional[str]
    denomination: str
    address: str