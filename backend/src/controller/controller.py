from __future__ import annotations

from typing import Any, Callable, Final, Protocol

from pydantic import validate_call

from model import Model


class Controller:
    _controller: Controller | None = None
    _actions: dict[str, Controller.Callback] = {}

    class Callback(Protocol):
        def __call__(self, controller: Controller, *args, **kwargs) -> Any: ...

    @classmethod
    def get_instance(cls) -> Controller:
        if cls._controller is None:
            raise RuntimeError('Controller has not been initialized')
        return cls._controller

    @classmethod
    def register(cls, name: str = '') -> Callable[[Controller.Callback], Any]:
        def wrapper(action: Controller.Callback) -> Controller.Callback:
            inner_name: str = name if name is not None else action.__name__
            if inner_name in cls._actions:
                raise ValueError(f"Action '{inner_name}' already exists")
            action = validate_call(action, config={'arbitrary_types_allowed': True})
            cls._actions[inner_name] = action
            return action

        return wrapper

    def __init__(self, model: Model) -> None:
        if self._controller is not None:
            raise RuntimeError('Controller has already been initialized')
        Controller._controller = self
        self.model: Final[Model] = model
        self.view = None

    def handle_client(self, action_name: str, args: dict[str, Any]) -> Any:
        if action_name not in self._actions:
            raise KeyError(f"Unknown action '{action_name}'")
        action: Callable[..., Any] = self._actions[action_name]
        return action(self, **args)

    def get_updates(self) -> list:
        return iter([])

    def clear_updates(self) -> None:
        pass


def register(name: str = '') -> Callable[[Controller.Callback], Any]:
    return Controller.register(name)
