from abc import ABC, abstractmethod
from asyncio import Task
from datetime import datetime, timedelta
from fastapi import WebSocket
from typing import Any, Callable, Hashable
import asyncio


class Queryable(ABC):
    def __init__(self, key: Hashable) -> None:
        self._key: Hashable = key

    def get_key(self) -> Hashable:
        return self._key

    @abstractmethod
    def get_data(self) -> dict[str | float | int, Any]:
        ...


class Controller:
    __slots__ = 'actions', '_data', '_notifications', '_sockets', '_tasks'

    def __init__(self) -> None:
        self._data: Queryable | None = None
        self._sockets: list[WebSocket] = list()
        self._notifications: set[Queryable] = set()
        self._tasks: dict[Hashable, Task] = dict()
        self.actions: dict[str, Callable] = dict()

    @property
    def data(self) -> Queryable:
        if self._data is None:
            raise RuntimeError('Data has not been set.')
        return self._data

    @data.setter
    def data(self, value: Queryable) -> None:
        if self._data is not None:
            pass  # TODO: Updates clients that data has changed
        self._data = value

    def action(self, action: str | Callable = '', *,
               overwrite: bool = False) -> Callable:
        name: str = action.__name__ if callable(action) else action
        if name == '':
            raise KeyError('WebSocket actions must have a name.')
        elif name in self.actions.keys() and not overwrite:
            raise KeyError(f'Cannot register \'{name}\'. '
                           f'Action already exists.')

        def inner(method: Callable) -> Callable:
            self.actions[name] = method
            return method

        return inner(action) if callable(action) else inner

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._sockets.append(websocket)

    async def disconnect(self, websocket: WebSocket, code: int = 1000,
                         reason: str | None = None) -> None:
        try:
            await websocket.close(code, reason)
        except RuntimeError:
            pass
        self._sockets.remove(websocket)

    def notify(self, notifier: Queryable,
               renotify: datetime | None = None) -> None:
        # Add the notification to the notifications set
        self._notifications.add(notifier)

        # If a reminder has been set, cancel it
        if notifier.get_key() in self._tasks.keys():
            key: Hashable = notifier.get_key()
            self._tasks[key].cancel()
            self._tasks.pop(key)

        if renotify is None:
            return

        async def reminder() -> None:
            now: datetime = datetime.now()
            while now < renotify:
                sleep: timedelta = now - renotify
                await asyncio.sleep(sleep.total_seconds())
                now = datetime.now()
            await self.broadcast({
                'key': notifier.get_key(),
                'data': notifier.get_data()
            })

        # Schedule a task to rebroadcast the data
        task: Task[None] = asyncio.create_task(reminder())
        self._tasks[notifier.get_key()] = task
        task.add_done_callback(lambda _: self._tasks.pop(notifier.get_key()))

    def get_notifications(self) -> list[dict[str | float | int, Any]]:
        updates: list[dict[str | float | int, Any]] = []
        for notifier in self._notifications:
            updates.append({
                'key': notifier.get_key(),
                'data': notifier.get_data()
            })
        return updates

    def clear_notifications(self) -> None:
        self._notifications.clear()

    async def broadcast(self, data: Any):
        async with asyncio.TaskGroup() as task_group:
            for socket in self._sockets:
                task_group.create_task(socket.send_json(data))


controller: Controller = Controller()
