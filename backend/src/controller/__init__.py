import json
import os
import traceback
from json import JSONDecodeError
from pathlib import Path
from typing import Any, Callable, Final

from fastapi import Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from model import Model
from pydantic import ValidationError

from .controller import Controller

www_directory: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
templates: Final[Jinja2Templates] = Jinja2Templates(www_directory)
app: Final[Controller] = Controller(Model(), debug=True, mount=[
    Mount('/', StaticFiles(directory=www_directory, html=True))
])


@app.get('/')
async def index(request: Request) -> Response:
    # FIXME
    data: str = json.dumps(app.model.get(), separators=(',', ':'))
    return templates.TemplateResponse('index.html', {'request': request,
                                                     'model': data})


@app.get('/{path}')
async def root(request: Request, path: str) -> Response:
    if path.endswith('.html'):
        return await index(request)
    return FileResponse(www_directory / path)


@app.websocket('/ws')
async def ws(websocket: WebSocket) -> None:
    await app.connect(websocket)
    socket_is_connected: bool = True
    while socket_is_connected:
        try:
            # Parse the JSON payload
            request: dict[str, Any] = await websocket.receive_json()

            # Ensure that the payload has the required keys
            if not all(key in request.keys() for key in
                       ('action', 'args', 'clientId', 'transactionId')):
                raise ValidationError('Missing payload key.')

            # Get the requested server action
            action: Callable | None = app.get_action(request['action'])
            if action is None:
                raise ValidationError(
                    f'Action \'{request['action']}\' does not exist')

            # Call the server action
            response_data: Any = action(*request['args'])

            # Begin to construct the response payload
            response: dict[str, Any] = {
                'data': response_data,
                'transactionId': request['transactionId'],
                'clientId': request['clientId'],
                'result': 'ok',
            }

            # Send the response payload and broadcast all notifications
            await websocket.send_json(response)
            while len(app.notifications) > 0:
                await app.broadcast(app.notifications.pop())

        except (WebSocketDisconnect, JSONDecodeError, ValidationError) as e:
            message: str = ''
            match e:
                case WebSocketDisconnect():
                    message = 'WebSocket disconnected.'
                case JSONDecodeError():
                    message = 'Invalid JSON payload.'
                case ValidationError():
                    message = 'Invalid payload schema.'
            await app.disconnect(websocket, 1007, message)
            socket_is_connected = False
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            response: dict[str, Any] = {
                'transactionId': request['transactionId'],  # type: ignore
                'clientId': request['clientId'],  # type: ignore
                'result': 'error',
                'data': {
                    'title': type(e).__name__, 'detail': str(e),
                    'filename': os.path.basename(tb[-1].filename),
                    'lineno': tb[-1].lineno
                },
            }
