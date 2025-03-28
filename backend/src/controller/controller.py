from __future__ import annotations

import asyncio
import logging
from typing import Any, Callable, Final

import netifaces
from fastapi import FastAPI, WebSocket
from model import Model
from pydantic import validate_call
from uvicorn import Config, Server

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


class Controller(FastAPI):
    __slots__ = '_actions', '_sockets', 'notifications'

    @classmethod
    def get_ip_addresses(cls) -> list[str]:
        ip_addresses: list[str] = []
        for interface in netifaces.interfaces():
            addresses = netifaces.ifaddresses(interface)
            if netifaces.AF_INET in addresses:
                ip_addresses += [item['addr']
                                 for item in addresses[netifaces.AF_INET]
                                 if item['addr'] != '127.0.0.1']
        return ip_addresses

    def __init__(self, model: Model, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.model: Final[Model] = model
        # TODO
        # self.view: Final[View] = view

        self._actions: dict[str, Callable[..., Any]] = {}
        self._sockets: list[WebSocket] = []
        self.notifications: Final[set[tuple]] = set()

    async def serve(self, host_ip: str = '0.0.0.0', port: int = 8000) -> None:
        # Configure and start the server
        config: Config = Config(self, host=host_ip, port=port, log_config=None,
                                access_log=False, log_level='warning')
        host: Server = Server(config)

        # Log the server's address and serve the application
        # FIXME
        # addresses: list[str] = get_ip_addresses()
        # app.log.info(f'Hosting Scoreboard on http://{addresses[0]}'
        #              f'{f':{port}' if port != 80 else ''}')
        await host.serve()

    def register(self, action: Callable[..., Any] | None = None,
                 name: str = '') -> Callable[..., Any]:
        def wrapper(inner_action: Callable) -> Callable[..., Any]:
            inner_name: str = (name if name is not None
                               else inner_action.__name__)
            if inner_name in self._actions:
                raise ValueError(f'Action \'{inner_name}\' already exists')
            inner_action = validate_call(inner_action)
            self._actions[inner_name] = inner_action
            return inner_action

        return wrapper if action is None else wrapper(action)

    def get_action(self, name: str) -> Callable[..., Any] | None:
        if name not in self._actions:
            return None
        return self._actions[name]

    async def connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self._sockets.append(socket)

    async def disconnect(self, websocket: WebSocket, code: int = 1000,
                         reason: str = '') -> None:
        try:
            await websocket.close(code, reason)
        except RuntimeError:
            pass
        finally:
            self._sockets.remove(websocket)

    async def broadcast(self, data: Any):
        async with asyncio.TaskGroup() as task_group:
            for socket in self._sockets:
                task_group.create_task(socket.send_json(data))
