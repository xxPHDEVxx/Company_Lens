import json
import os
import datetime

from pydantic import BaseModel


class BaseModelExporter:
    """This class is used to take a model and export it to a file.
    It will automatically append in a new array the incomming data.
    """

    def __init__(
        self,
        folder_dest: str,
        file_name: str = str(datetime.datetime.now(datetime.timezone.utc)),
    ) -> None:
        if not os.path.exists(folder_dest):
            os.makedirs(folder_dest)
        self.file_path = os.path.join(folder_dest, file_name)
        self.__data = []

    def export(self, data: list[BaseModel]):
        with open(self.file_path, "w+") as file:
            json.dump(data, file)

    def append(self, data: list[BaseModel]):
        if isinstance(data, BaseModel):
            self.__data.append(data.model_dump())
        elif isinstance(data, list):
            for d in data:
                self.__data.append(d.model_dump())
        self.export(self.__data)
