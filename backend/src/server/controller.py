from asyncio import Task
from datetime import datetime, timedelta
from fastapi import WebSocket, WebSocketDisconnect
from json import JSONDecodeError
from typing import Any, Callable, Hashable, Iterable
from .model import model, Queryable
import asyncio


class Controller:
    __slots__ = '_actions', '_active_sockets', '_tasks'

    def __init__(self) -> None:
        self._active_sockets: list[WebSocket] = []
        self._actions: dict[str, Callable] = {}
        self._tasks: dict[Any, Task] = {}

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

    async def broadcast(self, key: Hashable, data: dict):
        payload: dict[str, Any] = {'key': key, 'data': data}
        async with asyncio.TaskGroup() as task_group:
            for socket in self._active_sockets:
                task_group.create_task(socket.send_json(payload))

    def handle_notification(self, data: Queryable,
                            redeliver: datetime | None) -> None:
        # Cancel the previous task if it has not completed
        key: Hashable = data.get_key()
        if key in self._tasks.keys():
            task: Task = self._tasks[key]
            if not task.done():
                task.cancel()

        async def transmit(data: Queryable,
                           redeliver: datetime | None) -> None:
            # Broadcast the data at least once
            key: Hashable = data.get_key()
            await self.broadcast(key, data.get_data())

            # Sleep until the data is ready to be redlivered
            if redeliver is not None:
                now: datetime = datetime.now()
                while now < redeliver:
                    sleep: timedelta = now - redeliver
                    await asyncio.sleep(sleep.total_seconds())
                    now = datetime.now()
                await self.broadcast(key, data.get_data())

            # Allow the task to be garbage collected
            if key in self._tasks.keys():
                del self._tasks[key]

        self._tasks[key] = asyncio.create_task(transmit(data, redeliver))

    async def connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self._active_sockets.append(socket)

    async def disconnect(self, socket: WebSocket) -> None:
        await socket.close()
        self._active_sockets.remove(socket)

    async def handle_websocket(self, websocket: WebSocket) -> None:
        socket_is_connected: bool = True
        while socket_is_connected:
            try:
                payload: dict[str, Any] = await websocket.receive_json()
                if not all(key in {'action', 'args', 'transactionId'}
                           for key in payload.keys()):
                    raise UserWarning('Missing payload key.')

                if payload['action'] not in controller.actions:
                    raise UserWarning(f'No such action '
                                      f'\'{payload['action']}\'.')

                response = controller.call(payload['action'], payload['args'])

                # Fetch and handle any model updates that have occurred
                for notification in model.get_notifications():
                    controller.handle_notification(notification.data,
                                                   notification.redeliver)
                model.clear_notifications()

                await websocket.send_text(response)
            except JSONDecodeError:
                pass  # TODO
            except UserWarning:
                pass  # TODO
            except WebSocketDisconnect:
                socket_is_connected = False  # TODO
            except Exception:
                pass  # TODO


controller = Controller()
