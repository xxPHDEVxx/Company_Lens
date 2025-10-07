from dataclasses import dataclass, asdict


@dataclass
class BaseInvokerModel:

    def to_dict(self):
        return asdict(self)
