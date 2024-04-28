from __future__ import annotations
from abc import ABC, abstractmethod
import time


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
        
        def _encode_list(iter: list[any] | tuple[any]) -> list:
            new_list: list[any] = []
            for item in iter:
                if isinstance(item, (tuple, list)):
                    new_list.append(_encode_list(item))
                elif hasattr(item, "__dict__"):
                    new_list.append(_encode(item))
                else:
                    new_list.append(item)
            return new_list

        def _encode(item) -> dict:
            attributes: list[tuple[str, any]] = list(item.__dict__.items())
            dictionary: dict = {}
            for key, value in attributes:
                if key.startswith("_"):
                    key = key[1:]
                if hasattr(value, "__dict__"):
                    value = _encode(value)
                elif isinstance(value, (list, tuple)):
                    value = _encode_list(value)
                dictionary[key] = value
            return dictionary
        
        
        now: int = time.monotonic_ns()
        now = round(now / 1_000_000)
    
        dictionary: dict = {"now": now}
        dictionary |= _encode(self)
        return dictionary

    # @abstractmethod
    def decode(json: dict) -> Encodable:
        """Creates a new Encodable object from a dictionary.

        Args:
            json (dict): A dictionary object created from a JSON object.

        Returns:
            Encodable: A new Encodable with the same attributes as the JSON
            object.
        """
        pass
