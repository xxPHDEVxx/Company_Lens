import json


class JsonUtils:

    @staticmethod
    def load_json(file_path: str):
        with open(file_path, encoding="utf-8") as file:
            return json.load(file)

    @staticmethod
    def write_json(file_path: str, data: object):
        with open(file_path, "w") as file:
            json.dump(data, file, indent=4)

    @staticmethod
    def serialize(data: dict):
        return json.dumps(data)
