from __future__ import annotations

from typing import Final

from model import Model


class Controller:
    _controller: Controller | None = None

    @classmethod
    def get_instance(cls) -> Controller:
        if cls._controller is None:
            raise RuntimeError('Controller has not been initialized')
        return cls._controller

    def __init__(self, model: Model) -> None:
        if self._controller is not None:
            raise RuntimeError('Controller has already been initialized')
        Controller._controller = self
        self.model: Final[Model] = model
        self.view = None
