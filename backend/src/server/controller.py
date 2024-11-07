from __future__ import annotations
from datetime import datetime, timedelta
from importlib import import_module
from inspect import Parameter, signature
from json import JSONDecodeError, JSONEncoder
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.requests import Request
from starlette.responses import FileResponse, Response
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.templating import Jinja2Templates
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


def _fetch_method(module_name: str, method_name: str) -> Callable:
    try:
        module: ModuleType = import_module(f'server.api.{module_name}')
        method: Callable = getattr(module, method_name)
        if not callable(method):
            raise UserWarning(f'\'{method_name}\' is not callable')
    except ModuleNotFoundError:
        raise UserWarning(f'Unknown module \'{module_name}\'')
    except AttributeError:
        raise UserWarning(f'Unknown action \'{method_name}\'')
    return method


class _WebSocketClient(WebSocketEndpoint):
    encoding: Literal['text', 'bytes', 'json'] = 'text'
    encoder: JSONEncoder = JSONEncoder(separators=(',', ':'))
    debug: bool = False

    sockets: set[WebSocket] = set()
    updates: set[tuple[str, dict[str, Encodable]]] = set()

    async def on_connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self.id: UUID = uuid4()
        _WebSocketClient.sockets.add(socket)

        log.info(f'Socket \'{self.id}\' connected at {datetime.now()}')

    async def on_disconnect(self, socket: WebSocket, close_code: int) -> None:
        if socket in _WebSocketClient.sockets:
            _WebSocketClient.sockets.remove(socket)

        log.info(f'Socket \'{self.id}\' disconnected at {datetime.now()}')

    async def on_receive(self, socket: WebSocket, payload: bytes) -> None:
        log.debug(f'{payload} ({self.id})')

        # Instantiate a boilerplate JSON response
        response: dict[str, Encodable] = {
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

            # Get only the required arguments for the method
            method: Callable = _fetch_method(request['type'],
                                             request['action'])
            callback_signature: set[Parameter] = set(signature(method)
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
            response['data'] = method(**args)

            # When debugging, verify that the JSON response can be encoded
            if _WebSocketClient.debug:
                try:
                    _WebSocketClient.encoder.encode(response)
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

        text: str = _WebSocketClient.encoder.encode(response)
        await socket.send_text(text)

        # Flush the update set
        if len(_WebSocketClient.updates) > 0:
            emit_updates()


def add_update(type: str, id: dict[str, Encodable]) -> None:
    key: tuple[str, dict[str, Encodable]] = (type, id)
    _WebSocketClient.updates.add(key)


def emit_updates() -> None:
    payload: list[dict[str, Encodable]] = []
    while len(_WebSocketClient.updates) > 0:
        type, id = _WebSocketClient.updates.pop()
        getter: Callable = _fetch_method(type, 'get')
        try:
            payload.append({
                'id': id,
                'data': getter(**id)
            })
        except Exception:
            log.error('Unable to fetch model object')

    text: str = _WebSocketClient.encoder.encode(payload)
    for sock in _WebSocketClient.sockets:
        asyncio.create_task(sock.send_text(text))


async def serve(port: int = 8000, *, context: dict[str, Any] | None = None,
                debug: bool = False) -> None:
    if 1 > port > 65535:
        raise ValueError('invalid server port number')
    if debug:
        _WebSocketClient.debug = True
        log.setLevel(logging.DEBUG)

    frontend: Path = (Path(os.getcwd()) / 'frontend' / 'dist')
    template: Jinja2Templates = Jinja2Templates(frontend)

    def renderPage(request: Request) -> Response:
        path: Path = Path('index.html' if 'page'
                          not in request.path_params.keys()
                          else request.path_params['page'])
        log.debug(f'Handling request for \'{path}\'.')
        match path.suffix:
            case '.html':
                return template.TemplateResponse(request, str(path), context)
            case _:
                return FileResponse(frontend / path)

    # Instantiate the application
    instance: Starlette = Starlette(
        routes=(
            Route('/', renderPage),
            WebSocketRoute('/ws', _WebSocketClient),
            Mount('/assets', StaticFiles(directory=frontend / 'assets')),
            Route('/{page:str}', renderPage),
        ),
        debug=debug
    )

    # Determine the address of the server
    address: str = f'http://localhost:{port}'
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.settimeout(0)
            sock.connect(('1.1.1.1', 1))  # Doesn't actually send network data
            address = f'http://{sock.getsockname()[0]}:{port}'
    except OSError:
        pass

    # Start the web server
    host: str = '0.0.0.0'
    config: uvicorn.Config = uvicorn.Config(instance, host=host, port=port,
                                            log_config=None, access_log=False,
                                            log_level='warning')
    server: uvicorn.Server = uvicorn.Server(config)
    log.info(f'Starting server at \'{address}\'')
    await server.serve()
