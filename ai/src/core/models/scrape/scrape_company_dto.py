from dataclasses import dataclass, asdict
import json
from typing import Optional


@dataclass
class ScrapeCompanyDto:
    """Data Transfer Object for scraping company from the main app

    Returns:
        _type_: _description_
    """
    vat_number: str
    website: Optional[str]

    def to_dict(self):
        return asdict(self)

    def to_bytes(self):
        return json.dumps(self.to_dict()).encode()
