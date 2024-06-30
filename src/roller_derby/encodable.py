from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any


class ClientException(Exception):
    pass


class Encodable(ABC):
    @abstractmethod
    def encode(self) -> dict[str, Any]:
        """Encodes the Encodable into a dictionary which can then be sent to a
        client. This method is called recursively so that each sub-class is
        encoded into a sub-dictionary. All private members of the Encodable
        (i.e. members prefixed with an underscore) are converted to public
        members.

        Returns:
            dict: A dictionary representing the Encodable.
        """
        raise NotImplementedError()

    @staticmethod
    # @abstractmethod # TODO
    def decode(json: dict[str, Any]) -> Encodable:
        """Creates a new Encodable object from a dictionary.

        Args:
            json (dict): A dictionary object created from a JSON object.

        Returns:
            Encodable: A new Encodable with the same attributes as the JSON
            object.
        """
        raise NotImplementedError()
