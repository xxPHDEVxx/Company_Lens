from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class Currency(BaseModel):
    """
    Response model for currency data.
    Args:
        BaseModel (_type_): _description_
    """
    code: str
    name: str
    legacy: bool

class NbbDepositModel(BaseModel):
    """
    Un dépôt désigne la soumission officielle des comptes annuels d'une entreprise à la Banque Nationale de Belgique (BNB).
    Args:
        BaseModel (_type_): _description_
    """
    periodEndDateYear: int
    creationDate: datetime
    currency: Currency
    depositDate: datetime
    enterpriseNumber: str
    id: str
    language: str
    modelId: str
    modelName: str
    modificationDate: datetime
    periodEndDate: datetime
    periodStartDate: datetime
    status: str
    taxonomyName: str
    type: str
    subType: Optional[str]
    reference: str
    importFileType: str
    generalAssemblyApprovalDate: Optional[datetime]
    enterpriseName: str
    migration: bool
    csrdFileType: Optional[str]

class NbbDepositApiResponseModel(BaseModel):
    """Nbb response model wrapper

    Args:
        BaseModel (_type_): _description_
    """
    content: List[NbbDepositModel]
    page: int
    size: int
    totalElements: int
    totalPages: int
    hasContent: bool
    numberOfElements: int
    first: bool
    last: bool
    empty: bool
