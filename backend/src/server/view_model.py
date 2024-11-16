from abc import ABC, abstractmethod
from asyncio import Task
from datetime import datetime, timedelta
from fastapi import WebSocket
from typing import Any, Callable, final, Hashable
import asyncio
import logging

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


class Queryable(ABC):
    def __init__(self, key: Hashable) -> None:
        if not isinstance(key, tuple):
            key = (key, )
        self._key: Hashable = key

    @final
    def key(self) -> Hashable:
        return self._key

    @abstractmethod
    def get(self) -> dict[str | float | int, Any]:
        ...


class ViewModel:
    __slots__ = 'actions', '_data', '_notifications', '_sockets', '_tasks'
    log: logging.Logger = logging.getLogger(__name__)

    def __init__(self) -> None:
        self._data: Queryable | None = None
        self._sockets: list[WebSocket] = list()
        self._notifications: set[Queryable] = set()
        self._tasks: dict[Hashable, Task] = dict()
        self.actions: dict[str, Callable] = dict()

    @property
    def data(self) -> Queryable:
        if self._data is None:
            raise RuntimeError('Data has not been loaded.')
        return self._data

    def load_model(self, value: Queryable, load_actor: Any = None) -> None:
        is_initial: bool = self._data is None
        if not is_initial:
            pass  # TODO: Updates clients that data has changed
        self._data = value
        
        load_str: str = 'loaded' if is_initial else 'reloaded'
        actor_str: str = f'by \'{str(load_actor)}\'' if load_actor else ''
        self.log.info(f'Data model has been {load_str}{actor_str}')

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

        self.log.debug(f'Registering server action \'{name}\'')
        return inner(action) if callable(action) else inner

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._sockets.append(websocket)
        self.log.info(f'Client \'{str(websocket)}\' has connected')

    async def disconnect(self, websocket: WebSocket, code: int = 1000,
                         reason: str | None = None) -> None:
        try:
            await websocket.close(code, reason)
        except RuntimeError:
            pass
        self._sockets.remove(websocket)
        self.log.info(f'Client \'{str(websocket)}\' has disconnected')

    def notify(self, notifier: Queryable,
               renotify: datetime | None = None) -> None:
        # Add the notification to the notifications set
        self._notifications.add(notifier)

        # If a reminder has been set, cancel it
        if notifier.key() in self._tasks.keys():
            key: Hashable = notifier.key()
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
                'key': notifier.key(),
                'data': notifier.get()
            })

        # Schedule a task to rebroadcast the data
        task: Task[None] = asyncio.create_task(reminder())
        self._tasks[notifier.key()] = task
        task.add_done_callback(lambda _: self._tasks.pop(notifier.key()))

    def get_notifications(self) -> list[dict[str | float | int, Any]]:
        updates: list[dict[str | float | int, Any]] = []
        for notifier in self._notifications:
            updates.append({
                'key': notifier.key(),
                'data': notifier.get()
            })
        return updates

    def clear_notifications(self) -> None:
        self._notifications.clear()

    async def broadcast(self, data: Any):
        async with asyncio.TaskGroup() as task_group:
            for socket in self._sockets:
                task_group.create_task(socket.send_json(data))


controller: ViewModel = ViewModel()
