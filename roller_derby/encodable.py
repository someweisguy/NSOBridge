from __future__ import annotations
from abc import ABC, abstractmethod


class Encodable(ABC):
    def encode(self) -> dict:
        """Encodes the Encodable into a dictionary which can then be sent to a
        client. This method is called recursively so that each sub-class is
        encoded into a sub-dictionary. All private members of the Encodable
        (i.e. members prefixed with an underscore) are converted to public
        members.

        Returns:
            dict: A dictionary representing the Encodable.
        """

        def _encode(item) -> dict:
            attributes: list[tuple[str, any]] = list(item.__dict__.items())
            dictionary: dict = {}
            for key, value in attributes:
                if key.startswith("_"):
                    key = key[1:]
                if hasattr(value, "__dict__"):
                    value = _encode(value)
                dictionary[key] = value
            return dictionary

        return _encode(self)

    @abstractmethod
    def decode(json: dict) -> Encodable:
        """Creates a new Encodable object from a dictionary.

        Args:
            json (dict): A dictionary object created from a JSON object.

        Returns:
            Encodable: A new Encodable with the same attributes as the JSON
            object.
        """
        pass
