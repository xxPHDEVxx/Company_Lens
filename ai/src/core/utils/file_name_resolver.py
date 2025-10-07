import re
"(.) (.)"

class FileNameResolver:

    @staticmethod
    def convert(camel_case_string: str) -> str:
        # Convert camelCase to snake_case
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", camel_case_string)
        s2 = re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1)
        return s2.lower()
