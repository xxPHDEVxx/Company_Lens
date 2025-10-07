import json
from src.core.utils.file_name_resolver import FileNameResolver


class DocumentEditorBodyParser:

    def __init__(
        self, target, file_name_resolver: FileNameResolver = FileNameResolver()
    ):
        self.target = target
        self.file_name_resolver: FileNameResolver = file_name_resolver

    def parse(self, body: bytes):

        data = json.loads(body.decode())

        selected_text = data["selected_text"]
        action = data["action"]
        context = data["context"]

        del data["action"]
        del data["selected_text"]
        del data["context"]

        return self.target(selected_text=selected_text, action=action, context=context)
