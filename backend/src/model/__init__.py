from abc import ABC, abstractmethod
from typing import Any, Protocol


class AbstractState(ABC):
    def __setattr__(self, name: str, value: Any) -> None:
        notify: bool = getattr(self, name) != value
        super().__setattr__(name, value)
        if notify:
            pass  # FIXME: notify observers


class JSONSerializable(Protocol):
    def to_json(self) -> dict[str, Any]:
        raise NotImplementedError
