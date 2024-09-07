from __future__ import annotations
from datetime import datetime, timedelta
from inspect import Parameter, signature
from json import JSONDecodeError
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.requests import Request
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket
from types import UnionType
from typing import Any, Callable, Collection, Iterable, Literal, Mapping, Type
from pathlib import Path
from uuid import UUID, uuid4
import asyncio
import json
import logging
import uvicorn

log = logging.getLogger(__name__)

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


class MessageContext:
    def __init__(self) -> None:
        self._socket_id: UUID = uuid4()
        self._last_latency_check: datetime | None = None
        self._latency: timedelta = timedelta(milliseconds=0)
        self._sent: datetime | None = None
        self._received: datetime = datetime.min

    @property
    def socket_id(self) -> UUID:
        return self._socket_id

    @property
    def latency(self) -> timedelta:
        return self._latency

    @latency.setter
    def latency(self, new_latency: timedelta) -> None:
        if 0 > new_latency.total_seconds() > 5:
            raise ValueError('latency must be greater than 0 and less than '
                             '5000 milliseconds')
        self._latency = new_latency
        self._last_latency_check = datetime.now()

    @property
    def sent(self) -> datetime | None:
        return self._sent

    @property
    def received(self) -> datetime:
        return self._received


class WebSocketClient(WebSocketEndpoint):
    encoding: Literal['text', 'bytes', 'json'] = 'text'

    @staticmethod
    def updateLatency(clientTimestamp: datetime, serverTimestamp: datetime,
                      context: MessageContext) -> None:
        if context.sent is None:
            # This branch should be unreachable
            raise RuntimeError('an unexpected error occurred')
        context.latency = ((context.sent - clientTimestamp) -
                           ((context.received - serverTimestamp) / 2))

    callbacks: dict[str, Callable[..., Collection | None]] = {
        'logMessage': lambda message: log.info(str(message)),
        'updateLatency': updateLatency,
    }

    async def on_connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self.context = MessageContext()

        log.info(f'Socket \'{self.context.socket_id}\' connected at '
                 f'{datetime.now().isoformat()}')

    async def on_receive(self, socket: WebSocket, payload: bytes) -> None:
        now: datetime = datetime.now()

        log.debug(f'{payload} ({self.context.socket_id})')

        # Instantiate a boilerplate JSON response
        response: dict[str, Any] = {
            'serverTimestamp': now.isoformat(),
            'latencyMilliseconds': round(self.context.latency
                                         .total_seconds() * 1000),
            'updateLatency': (self.context._last_latency_check is None or
                              (now - self.context._last_latency_check)
                              > timedelta(seconds=20)),
        }

        try:
            # Attempt to parse the request payload as JSON
            request: dict[str, Any] = json.loads(payload)

            # Validate that the JSON request contains the required keys
            required_keys: tuple[str, ...] = ('action', 'clientTimestamp')
            if not all([key in request.keys() for key in required_keys]):
                raise UserWarning('Request must contain all of: '
                                  f'{str(required_keys)[1:-1]}')
            if 'args' not in request.keys() or request['args'] is None:
                request['args'] = {}
            response['action'] = request['action']  # Update response
            try:
                iso_format: str = request['clientTimestamp']
                request['clientTimestamp'] = datetime.fromisoformat(iso_format)
                response['clientTimestamp'] = iso_format  # Update response
            except Exception:
                raise UserWarning('\'clientTimestamp\' is invalid: '
                                  f'\'{request['clientTimestamp']}\'')

            # Update the client context
            self.context._received = now
            self.context._sent = request['clientTimestamp']

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
            if 'context' in [arg.name for arg in callback_signature]:
                args['context'] = self.context

            # Validate that the types of each argument is correct
            for arg in callback_signature:
                if arg.name not in args.keys():
                    if arg.default is Parameter.empty:
                        raise UserWarning('API action '
                                          f'\'{request['action']}\' is '
                                          f'missing argument \'{arg.name}\'')
                    continue  # Missing argument is optional
                provided_type: Type = type(args[arg.name])
                required_type: Type | UnionType = arg.annotation
                if required_type is Parameter.empty:
                    continue  # Required type is not specified
                elif provided_type is str and required_type is datetime:
                    # ISO 8601 strings can be converted to datetime objects
                    try:
                        args[arg.name] = datetime.fromisoformat(args[arg.name])
                    except Exception:
                        raise UserWarning(f'\'{arg.name}\' is invalid: '
                                          f'\'{args[arg.name]}\'')
                elif ((isinstance(required_type, UnionType) and
                       provided_type not in required_type.__args__)
                      or provided_type is not required_type):
                    raise UserWarning(f'API action \'{request['action']}\' '
                                      f'argument \'{arg.name}\' type is '
                                      'invalid')

            # Execute the API action and get the response data
            response['data'] = callback(**args)

            # Verify that the JSON response can be encoded
            elements: list[Iterable] = [response.values()]
            for element in elements:
                if isinstance(element, Mapping):
                    elements.extend(element.values())
                elif (isinstance(element, Iterable)
                      and not isinstance(element, str)):
                    elements.extend(element)
                elif (not isinstance(element, (int, float, str, bytes, bool))
                      and element is not None):
                    raise EncodingWarning('The API action '
                                          f'\'{request['action']}\' response '
                                          'is not valid')
        except (JSONDecodeError, UserWarning) as e:
            # The request was invalid
            log.debug('An invalid request was received from '
                      f'{self.context.socket_id}')
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
            # An error occurred with the game logic
            log.error(str(e), exc_info=e)
            response['error'] = {
                'title': type(e).__name__,
                'detail': str(e)
            }

        await socket.send_json(response)

    async def on_disconnect(self, socket: WebSocket, close_code: int) -> None:
        log.info(f'Socket \'{self.context.socket_id}\' disconnected at '
                 f'{datetime.now().isoformat()}')


async def serve(port: int = 8000, *, host: str = '0.0.0.0') -> None:
    # TODO: clean this path up
    dir: Path = Path(__file__).parent.parent.parent / 'frontend' / 'build'

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

    # Start the web server
    config: uvicorn.Config = uvicorn.Config(instance, host=host, port=port,
                                            log_level='critical')
    server: uvicorn.Server = uvicorn.Server(config)
    log.info(f'Starting the web server at {datetime.now()}')
    await server.serve()


if __name__ == '__main__':
    asyncio.run(serve())
