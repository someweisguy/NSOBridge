from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from derby import Series
from typing import Any, Callable, Hashable, Iterable


class Queryable(ABC):
    def __init__(self, key: Hashable) -> None:
        self._key: Hashable = key

    def get_key(self) -> Hashable:
        return self._key

    @abstractmethod
    def get_data(self) -> dict[str | float | int, Any]:
        ...


class Model[T: Queryable]:
    __slots__ = '_data', '_notifications'

    @dataclass(slots=True)
    class Notification:
        data: Queryable
        redeliver: datetime | None = None

        def __eq__(self, other: Any) -> bool:
            return self.data == other

    def __init__(self, data: T) -> None:
        self._data: T = data
        self._notifications: set[Model.Notification] = set()
        self._actions: dict[str, Callable] = dict()

    @property
    def data(self) -> T:
        return self._data
    
    @property
    def actions(self) -> Iterable[str]:
        return self._actions.keys()

    def action(self, action: str | Callable = '', *,
               overwrite: bool = False) -> Callable:
        name: str = action.__name__ if callable(action) else action
        if name == '':
            raise KeyError('WebSocket actions must have a name.')
        elif name in self._actions.keys() and not overwrite:
            raise KeyError(f'Cannot register \'{name}\'. '
                           f'Action already exists.')

        def inner_decorator(method: Callable) -> Callable:
            self._actions[name] = method
            return method

        return (inner_decorator(action) if callable(action)
                else inner_decorator)
    
    def call(self, action_name: str, args: dict[str, Any]) -> Any:
        method: Callable = self._actions[action_name]
        return method(**args)

    def notify(self, data: Queryable,
               redeliver: datetime | None = None) -> None:
        if data in self._notifications:
            self._notifications.remove(data)
        self._notifications.add(Model.Notification(data, redeliver))

    def get_notifications(self) -> list[Notification]:
        return list(self._notifications)

    def clear_notifications(self) -> None:
        self._notifications.clear()


model: Model[Series] = Model(Series())
