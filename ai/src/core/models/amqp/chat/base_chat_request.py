from dataclasses import dataclass, asdict


@dataclass
class BaseChatRequest:
    chat_name: str
    session_id: str
    data: dict

    def to_dict(self):
        return asdict(self)
