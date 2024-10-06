from __future__ import annotations
from datetime import datetime, timedelta
from inspect import getmodule, Parameter, signature
from json import JSONDecodeError, JSONEncoder
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.requests import Request
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket
from types import ModuleType, UnionType
from typing import Any, Callable, get_args, Literal
from pathlib import Path
from uuid import UUID, uuid4
import asyncio
import json
import logging
import os
import socket
import uvicorn


log = logging.getLogger(__name__)

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)

type Encodable = (str | float | int | bool | None | list[Encodable] |
                  tuple[Encodable, ...] | dict[str, Encodable])

type Decodable = Encodable | timedelta


class WebSocketClient(WebSocketEndpoint):
    encoding: Literal['text', 'bytes', 'json'] = 'text'
    encoder: JSONEncoder = JSONEncoder(separators=(',', ':'))
    debug: bool = False

    sockets: set[WebSocket] = set()
    actions: dict[tuple[str, str], Callable[..., Encodable]] = {
        ('server', 'getInfo'): lambda: {'api': '0.1.0'},
        ('server', 'logMessage'): lambda message: log.info(str(message)),
        ('server', 'updateLatency'): lambda: None,
    }
    updates: set[tuple[str, dict[str, Encodable]]] = set()

    async def on_connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self.id: UUID = uuid4()
        WebSocketClient.sockets.add(socket)

        log.info(f'Socket \'{self.id}\' connected at {datetime.now()}')

    async def on_disconnect(self, socket: WebSocket, close_code: int) -> None:
        if socket in WebSocketClient.sockets:
            WebSocketClient.sockets.remove(socket)

        log.info(f'Socket \'{self.id}\' disconnected at {datetime.now()}')

    async def on_receive(self, socket: WebSocket, payload: bytes) -> None:
        log.debug(f'{payload} ({self.id})')

        # Instantiate a boilerplate JSON response
        response: dict[str, Any] = {
            'serverTimestamp': str(datetime.now()),
        }

        try:
            # Attempt to parse the request payload as JSON
            request: dict[str, Any] = json.loads(payload)

            # Validate that the JSON request contains the required keys
            required_keys: tuple[str, ...] = ('action', 'transactionId')
            if not all([key in request.keys() for key in required_keys]):
                raise UserWarning('Request must contain all of: '
                                  f'{str(required_keys)[1:-1]}')
            if 'args' not in request.keys() or request['args'] is None:
                request['args'] = {}
            response['action'] = request['action']
            response['transactionId'] = request['transactionId']

            # Ensure that the requested action has a callback
            key: tuple[str, str] = (request['type'], request['action'])
            if key not in WebSocketClient.actions.keys():
                raise UserWarning(f'API action \'{key[0]}/{key[1]}\' does '
                                  'not exist')
            callback: Callable = WebSocketClient.actions[key]

            # Get only the required arguments for the callback
            callback_signature: set[Parameter] = set(signature(callback)
                                                     .parameters.values())
            args: dict[str, Any] = {k: v for k, v in request['args'].items()
                                    if k in set([arg.name for arg in
                                                 callback_signature])}

            # Automatically convert certain compatible types
            for arg in callback_signature:
                if arg.name not in args.keys():
                    continue  # Ignore unused args
                provided_type: type = type(args[arg.name])
                required_types: tuple[type, ...] = (arg.annotation,)
                if isinstance(required_types[0], UnionType):
                    required_types = get_args(arg.annotation)
                if (provided_type in (int, float)
                        and timedelta in required_types):
                    # Convert numbers to timedelta objects
                    args[arg.name] = timedelta(milliseconds=args[arg.name])
                elif provided_type == str:
                    if UUID in required_types:
                        # Convert strings to UUIDs
                        args[arg.name] = UUID(args[arg.name])
                    elif datetime in required_types:
                        # ISO 8601 strings can be converted to datetime objects
                        args[arg.name] = datetime.fromisoformat(args[arg.name])

            # Execute the API action and get the response data
            response['data'] = callback(**args)

            # When debugging, verify that the JSON response can be encoded
            if WebSocketClient.debug:
                try:
                    WebSocketClient.encoder.encode(response)
                except TypeError as e:
                    del response['data']
                    raise EncodingWarning from e
        except (JSONDecodeError, UserWarning) as e:
            # The request was invalid
            log.info(f'An invalid request was received from \'{self.id}\'')
            if 'transactionId' not in request.keys():
                return  # Don't respond without a transaction ID
            response['error'] = {
                'title': 'Bad Request',
                'detail': str(e)
            }
        except EncodingWarning as e:
            # The response could not be encoded properly
            log.critical(str(e), exc_info=e)
            response['error'] = {
                'title': 'Internal Server Error',
                'detail': str(e)
            }
        except Exception as e:
            # An error occurred in the game logic
            log.error(str(e), exc_info=e)
            response['error'] = {
                'title': type(e).__name__,
                'detail': str(e)
            }

        text: str = WebSocketClient.encoder.encode(response)
        await socket.send_text(text)

        # Flush the update set
        if len(WebSocketClient.updates) > 0:
            broadcast_updates()


def register(callback: Callable | None = None, name: str = '') -> Callable:
    def inner(command: Callable) -> Callable:
        action: str = (command.__name__ if name == '' else name)
        module: ModuleType | None = getmodule(command)
        type: str = (module.__name__.split('.')[-1] if module is not None
                     else 'host')
        log.info(f'Registering \'{type}/{action}\' as a server action')
        key: tuple[str, str] = (type, action)
        if action in WebSocketClient.actions.keys():
            raise ValueError(f'\'{key}\' is already a server action key')
        WebSocketClient.actions[key] = command
        return command

    return inner(callback) if callable(callback) else inner


def queue_update(type: str, id: dict[str, Encodable]) -> None:
    key: tuple[str, dict[str, Encodable]] = (type, id)
    WebSocketClient.updates.add(key)


def broadcast_updates() -> None:
    payload: list[dict[str, Encodable]] = []
    while len(WebSocketClient.updates) > 0:
        type, id = WebSocketClient.updates.pop()
        try:
            payload.append({
                'id': id,
                'data': WebSocketClient.actions[(type, 'get')](**id)
            })
        except Exception:
            log.error('Unable to fetch model object')

    text: str = WebSocketClient.encoder.encode(payload)
    for sock in WebSocketClient.sockets:
        asyncio.create_task(sock.send_text(text))


async def serve(port: int = 8000, *, debug: bool = False) -> None:
    if 1 > port > 65535:
        raise ValueError('invalid server port number')
    if debug:
        WebSocketClient.debug = True
        log.setLevel(logging.DEBUG)

    directory: Path = (Path(os.getcwd()) / 'frontend' / 'dist')

    def renderPage(request: Request):
        path: Path = Path('index.html' if 'page'
                          not in request.path_params.keys()
                          else request.path_params['page'])
        log.debug(f'Handling request for \'{path}\'.')
        return FileResponse(directory / path)

    # Instantiate the application
    instance: Starlette = Starlette(
        routes=(
            Route('/', renderPage),
            WebSocketRoute('/ws', WebSocketClient),
            Mount('/assets', StaticFiles(directory=directory / 'assets')),
            Route('/{page:str}', renderPage),
        )
    )
    instance.debug = debug

    # Determine the address of the server
    address: str = f'http://localhost:{port}'
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0)
        sock.connect(('1.1.1.1', 1))  # Doesn't actually send network data
        address = f'http://{sock.getsockname()[0]}:{port}'

    # Start the web server
    host: str = '0.0.0.0'
    config: uvicorn.Config = uvicorn.Config(instance, host=host, port=port,
                                            log_config=None, access_log=False,
                                            log_level='warning')
    server: uvicorn.Server = uvicorn.Server(config)
    log.info(f'Starting server at \'{address}\'')
    await server.serve()
