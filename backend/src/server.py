from __future__ import annotations
from datetime import datetime, timedelta
from inspect import Parameter, signature
from json import JSONDecodeError
from roller_derby.interface import Servable
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.requests import Request
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket
from typing import Any, Callable, Collection, Literal
from pathlib import Path
from uuid import UUID, uuid4
import asyncio
import json
import logging
import socket
import uvicorn


log = logging.getLogger(__name__)

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


class WebSocketClient(WebSocketEndpoint):
    encoding: Literal['text', 'bytes', 'json'] = 'text'

    sockets: set[WebSocket] = set()
    callbacks: dict[str, Callable[..., Collection | None]] = {
        'getServerInfo': lambda: {'api': '0.1.0'},
        'logMessage': lambda message: log.info(str(message)),
        'updateLatency': lambda: None,
    }
    updates: set[Servable] = set()

    async def on_connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self.id: UUID = uuid4()
        WebSocketClient.sockets.add(socket)

        log.info(f'Socket \'{self.id}\' connected at '
                 f'{datetime.now().isoformat()}')

    async def on_disconnect(self, socket: WebSocket, close_code: int) -> None:
        if socket in WebSocketClient.sockets:
            WebSocketClient.sockets.remove(socket)

        log.info(f'Socket \'{self.id}\' disconnected at '
                 f'{datetime.now().isoformat()}')

    async def on_receive(self, socket: WebSocket, payload: bytes) -> None:
        now: datetime = datetime.now()

        log.debug(f'{payload} ({self.id})')

        # Instantiate a boilerplate JSON response
        response: dict[str, Any] = {
            'serverTimestamp': now.isoformat(),
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
            if request['action'] not in WebSocketClient.callbacks.keys():
                raise UserWarning(f'API action \'{request['action']}\' does '
                                  'not exist')
            callback: Callable = WebSocketClient.callbacks[request['action']]

            # Get only the required arguments for the callback
            callback_signature: set[Parameter] = set(signature(callback)
                                                     .parameters.values())
            args: dict[str, Any] = {k: v for k, v in request['args'].items()
                                    if k in set([arg.name for arg in
                                                 callback_signature])}

            # Validate that the types of each argument is correct
            for arg in callback_signature:
                if arg.name not in args.keys():
                    if arg.default is Parameter.empty:
                        raise UserWarning('API action '
                                          f'\'{request['action']}\' is '
                                          f'missing argument \'{arg.name}\'')
                    continue  # Missing argument is optional
                provided_type: str = type(args[arg.name]).__name__
                required_types: list[str] = (arg.annotation.split(' | ')
                                             if (arg.annotation is not
                                                 Parameter.empty) else [])
                if len(required_types) == 0:
                    continue  # Required type is not specified
                elif (provided_type in ('int', 'float') and
                      'timedelta' in required_types):
                    # Convert numbers to timedelta objects
                    args[arg.name] = timedelta(milliseconds=args[arg.name])
                elif provided_type == 'str' and 'datetime' in required_types:
                    # ISO 8601 strings can be converted to datetime objects
                    try:
                        args[arg.name] = datetime.fromisoformat(args[arg.name])
                    except Exception:
                        raise UserWarning(f'\'{arg.name}\' is invalid: '
                                          f'\'{args[arg.name]}\'')
                elif provided_type not in required_types:
                    raise UserWarning(f'API action \'{request['action']}\' '
                                      f'argument \'{arg.name}\' type is '
                                      'invalid')

            # Execute the API action and get the response data
            response['data'] = callback(**args)

            # Verify that the JSON response can be encoded
            try:
                json.dumps(response)
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

        await socket.send_json(response)

        # Flush the update set
        if len(WebSocketClient.updates) > 0:
            broadcast_updates()


def register(callback: str | Callable = '') -> Callable:
    def inner(command: Callable) -> Callable:
        key: str = (command.__name__ if isinstance(
            callback, Callable) or callback == '' else callback)
        if key in WebSocketClient.callbacks.keys():
            raise ValueError(f'\'{key}\' is already a server action key')
        log.info(f'Registering \'{key}\' as a server action key')
        WebSocketClient.callbacks[key] = command
        return command

    return inner(callback) if callable(callback) else inner


def queue_update(servable: Servable) -> None:
    WebSocketClient.updates.add(servable)


def broadcast_updates() -> None:
    for update in WebSocketClient.updates:
        for sock in WebSocketClient.sockets:
            asyncio.create_task(sock.send_json(update.serve()))
    else:
        WebSocketClient.updates.clear()


async def serve(port: int = 8000) -> None:
    if 1 > port > 65535:
        raise ValueError('invalid server port number')

    # TODO: clean this path up
    dir: Path = Path(__file__).parent.parent.parent / 'frontend' / 'dist'

    def renderPage(request: Request):
        path: Path = Path('index.html' if 'page'
                          not in request.path_params.keys()
                          else request.path_params['page'])
        log.debug(f'Handling request for \'{path}\'.')
        return FileResponse(dir/path)

    # Instantiate the application
    instance: Starlette = Starlette(
        routes=(
            Route('/', renderPage),
            WebSocketRoute('/ws', WebSocketClient),
            Mount('/assets', StaticFiles(directory=dir/'assets')),
            Route('/{page:str}', renderPage),
        )
    )
    instance.debug = True

    # Determine the address of the server
    address: str = f'http://localhost:{port}'
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0)
        sock.connect(('1.1.1.1', 1))  # Doesn't actually send network data
        address = f'http://{sock.getsockname()[0]}:{port}'

    # Start the web server
    host: str = '0.0.0.0'
    config: uvicorn.Config = uvicorn.Config(instance, host=host, port=port,
                                            log_level='critical')
    server: uvicorn.Server = uvicorn.Server(config)
    log.info(f'Starting server at \'{address}\'')
    await server.serve()


if __name__ == '__main__':
    import roller_derby.series  # noqa
    asyncio.run(serve())
