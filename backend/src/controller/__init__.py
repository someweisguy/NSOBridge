from __future__ import annotations

from pydantic import validate_call
from typing import Final, Callable, Any

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
        self._actions: dict[str, Callable[..., Any]] = {}
        
    def register(self, name: str = '') -> Callable[..., Any]:
        def wrapper(action: Callable) -> Callable[..., Any]:
            inner_name: str = name if name is not None else action.__name__
            if inner_name in self._actions:
                raise ValueError(f'Action \'{inner_name}\' already exists')
            action = validate_call(action)
            self._actions[inner_name] = action
            return action

        return wrapper
    
    def get_action(self, name: str) -> Callable[..., Any] | None:
        if name not in self._actions:
            return None
        return self._actions[name]
