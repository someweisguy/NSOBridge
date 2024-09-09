from abc import ABC, abstractmethod
from typing import Any


class Requestable(ABC):
    @abstractmethod
    def serve(self) -> dict[str, Any]:
        ...
