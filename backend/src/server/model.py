# from abc import ABC, abstractmethod
# from dataclasses import dataclass
# from datetime import datetime
# from typing import Any, Callable, Hashable, Iterable


# class Model:
#     __slots__ = '_actions', '_data', '_notifications'

#     @dataclass(slots=True)
#     class Notification:
#         data: Queryable
#         redeliver: datetime | None = None

#         def __eq__(self, other: Any) -> bool:
#             return self.data == other

#     def __init__(self) -> None:
#         self._data: Queryable | None = None
#         self._notifications: set[Model.Notification] = set()
#         self._actions: dict[str, Callable] = dict()





#     def call(self, action_name: str, args: dict[str, Any]) -> Any:
#         method: Callable = self._actions[action_name]
#         return method(**args)

#     def notify(self, data: Queryable,
#                redeliver: datetime | None = None) -> None:
#         if data in self._notifications:
#             self._notifications.remove(data)
#         self._notifications.add(Model.Notification(data, redeliver))

#     def get_notifications(self) -> list[Notification]:
#         return list(self._notifications)

#     def clear_notifications(self) -> None:
#         self._notifications.clear()
