from datetime import datetime, timedelta
from inspect import signature
from json import JSONDecodeError
from typing import Any, Callable, Collection
from websockets.asyncio.server import serve, ServerConnection
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK
import asyncio
import json


callbacks: dict[str, Callable[..., Collection | None]] = {}


async def _handler(socket: ServerConnection) -> None:
    while True:
        try:
            # Fetch the socket message from the server
            payload: str = str(await socket.recv(decode=True))
            now: datetime = datetime.now()
            response: dict[str, Any] = {}

            # Parse the payload from the websocket and add the received time
            data: dict[str, Any] = json.loads(payload)

            # Ensure the payload is formatted correctly
            required_keys: tuple[str, ...] = ('action', 'args')
            if not all([key in required_keys for key in data.keys()]):
                raise JSONDecodeError('request is malformed', payload, -1)

            callback_name: str = data['action']
            if callback_name in callbacks:
                # Add additional arguments
                latency: timedelta = timedelta(seconds=(socket.latency / 2))
                data['args'].update({'timestamp': now - latency})

                # Get the intersection of the client args and the callback args
                callback: Callable = callbacks[callback_name]
                args: dict[str, Any] = {k: v for k, v in data['args'].items()
                                        if k in set([arg.name for arg in
                                                    signature(callback)
                                                    .parameters.values()])}

                # Execute the callback
                response['data'] = callback(**args)
                response['status'] = 'ok'
        except JSONDecodeError as e:
            # The websocket payload is malformed
            response['status'] = 'error'
            response['data'] = str(e)
        except (ConnectionClosedError, ConnectionClosedOK) as e:
            # The connection was closed
            print(e)  # TODO: handle the connection being closed
            return
        except Exception as e:
            # An error occurred during the handling of the callback
            response['status'] = 'error'
            response['data'] = str(e)
            # TODO: add traceback
        finally:
            await socket.send(json.dumps(response, separators=(',', ':')))
            # TODO: broadcast any updates


async def run(port: int = 8000, *, host: str = 'localhost') -> None:
    stop = asyncio.get_running_loop().create_future()
    async with serve(_handler, host, port):
        await stop
