from abc import ABC, abstractmethod
from asyncio import Task
from datetime import datetime, timedelta
from fastapi import WebSocket, WebSocketDisconnect
from json import JSONDecodeError
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

    async def broadcast(self, data: Any):
        async with asyncio.TaskGroup() as task_group:
            for socket in self._sockets:
                task_group.create_task(socket.send_json(data))

    async def handle_websocket(self, websocket: WebSocket) -> None:
        # Accept the connection and save it as an active connection
        await websocket.accept()
        self._sockets.append(websocket)

        socket_is_connected: bool = True
        while socket_is_connected:
            try:
                # Parse the JSON payload
                request: dict[str, Any] = await websocket.receive_json()

                # Ensure that the payload has the required keys
                if not all(key in {'action', 'args', 'transactionId'}
                           for key in request.keys()):
                    raise UserWarning('Missing payload key.')

                # Begin to construct the response payload
                response: dict[str, Any] = {
                    'transactionId': request['transactionId']
                }

                # Validate the desired action is defined
                if request['action'] not in self.actions.keys():
                    raise UserWarning(f'No such action '
                                      f'\'{request['action']}\'.')

                # Call the desired API function and return the result
                response['data'] = self.actions[request['action']](
                    **request['args'])
                await websocket.send_json(response)

            except JSONDecodeError:
                pass  # TODO
            except UserWarning:
                pass  # TODO
            except WebSocketDisconnect:
                socket_is_connected = False  # TODO
            except Exception:
                pass  # TODO
            finally:
                # Fetch and handle any model updates that have occurred
                updates: list[dict[str | float | int, Any]] = []
                for notifier in self._notifications:
                    updates.append({
                        'key': notifier.get_key(),
                        'data': notifier.get_data()
                    })
                if len(updates) > 0:
                    await self.broadcast(updates)
                    self._notifications.clear()

        # Close the connection
        self._sockets.remove(websocket)


controller: Controller = Controller()
