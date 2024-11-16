from __future__ import annotations
from abc import ABC, abstractmethod
from asyncio import Task
from datetime import datetime, timedelta
from importlib import import_module
from types import ModuleType
from fastapi import WebSocket
from typing import Any, Callable, final, Hashable, TYPE_CHECKING
import asyncio
import logging
import inspect
import os

if TYPE_CHECKING:
    from derby import Series as Model


logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


class Queryable[T: Hashable](ABC):
    def __init__(self, id: T) -> None:
        self._id: T = id

    @final
    @property
    def id(self) -> T:
        return self._id

    @property
    def name(self) -> str:
        return type(self).__name__.lower()

    @abstractmethod
    def get(self) -> dict[str | float | int, Any]:
        ...

    @final
    def encode(self) -> dict[str | float | int, Any]:
        return {
            'id': self._id,
            'type': self.name,
            'data': self.get()
        }


class ViewModel:
    __slots__ = ('actions', '_api_directory', '_data', '_notifications',
                 '_sockets', '_tasks')

    log: logging.Logger = logging.getLogger(__name__)

    def __init__(self) -> None:
        self._data: Model | None = None
        self._api_directory: str = 'api'
        self._sockets: list[WebSocket] = list()
        self._notifications: set[Queryable] = set()
        self._tasks: dict[Hashable, Task] = dict()
        self.actions: dict[tuple[str, str], Callable] = dict()

    @property
    def api_directory(self) -> str:
        return self._api_directory

    @api_directory.setter
    def api_directory(self, value: str) -> None:
        self._api_directory = value

    @property
    def data(self) -> Model:
        if self._data is None:
            raise RuntimeError('Data has not been initialized')
        return self._data

    def set_model(self, value: Model, load_actor: Any = None) -> None:
        is_initial: bool = self._data is None
        if not is_initial:
            pass  # TODO: Updates clients that data has changed
        self._data = value

        load_str: str = 'set' if is_initial else 'reset'
        actor_str: str = f'by \'{str(load_actor)}\'' if load_actor else ''
        self.log.info(f'The data model has been {load_str}{actor_str}')

    def action(self, function: Callable | None = None, *, module: str = '',
               method: str = '', overwrite: bool = False) -> Callable:
        module_name, method_name = module, method

        def inner(method: Callable) -> Callable:
            nonlocal module_name, method_name
            if not module_name:
                module: ModuleType | None = inspect.getmodule(method)
                if module is None:
                    raise RuntimeError('Module was not found')
                *_, module_name = module.__name__.split('.')
            if not method_name:
                method_name = method.__name__
            key: tuple[str, str] = (module_name, method_name)
            if key in self.actions.keys() and not overwrite:
                raise RuntimeError(f'Action \'{module_name}, {method_name}\' '
                                   'already exists')
            self.actions[key] = method
            self.log.debug(f'\'{module_name}, {method_name}\' has been '
                           'registered as a server action')
            return method

        return inner if function is None else inner(function)

    def load_api(self, package_name: str):
        package: ModuleType = import_module(package_name)
        for module_name in os.listdir(package.__path__[0]):
            if module_name.endswith(".py") and module_name != "__init__.py":
                module: ModuleType = import_module(
                    f"{package_name}.{module_name[:-3]}")
                globals()[module_name[:-3]] = module

    def call(self, module_name: str, method_name: str,
             args: dict[str, Any] = {}) -> dict:
        method: Callable = self.actions[(module_name, method_name)]
        return method(**args)

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
        self.log.info(f'Client \'{str(websocket)}\' has disconnected '
                      f'({reason})')

    def notify(self, notifier: Queryable,
               renotify: datetime | None = None) -> None:
        # Add the notification to the notifications set
        self._notifications.add(notifier)

        # If a reminder has been set, cancel it
        if notifier.id() in self._tasks.keys():
            key: Hashable = notifier.id()
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
            await self.broadcast(notifier.encode())

        # Schedule a task to rebroadcast the data
        task: Task[None] = asyncio.create_task(reminder())
        self._tasks[notifier.id()] = task
        task.add_done_callback(lambda _: self._tasks.pop(notifier.id()))

    def get_notifications(self) -> list[dict[str | float | int, Any]]:
        updates: list[dict[str | float | int, Any]] = []
        for notifier in self._notifications:
            updates.append(notifier.encode())
        return updates

    def clear_notifications(self) -> None:
        self._notifications.clear()

    async def broadcast(self, data: Any):
        async with asyncio.TaskGroup() as task_group:
            for socket in self._sockets:
                task_group.create_task(socket.send_json(data))


controller: ViewModel = ViewModel()
