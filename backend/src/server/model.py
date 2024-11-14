from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Hashable


class Queryable(ABC):
    def __init__(self, key: Hashable) -> None:
        self._key: Hashable = key

    def get_key(self) -> Hashable:
        return self._key

    @abstractmethod
    def get_data(self) -> dict[str | float | int, Any]:
        ...


class Model[T]:
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

    @property
    def data(self) -> T:
        return self._data

    def notify(self, data: Queryable,
               redeliver: datetime | None = None) -> None:
        if data in self._notifications:
            self._notifications.remove(data)
        self._notifications.add(Model.Notification(data, redeliver))

    def get_notifications(self) -> list[Notification]:
        return list(self._notifications)

    def clear_notifications(self) -> None:
        self._notifications.clear()


model: Model = Model(None)
