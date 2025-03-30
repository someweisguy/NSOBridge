import json
import os
import traceback
from json import JSONDecodeError
from pathlib import Path
from typing import Annotated, Any, Callable, Final

from controller import Controller
from fastapi import (Depends, FastAPI, Request, Response, WebSocket,
                     WebSocketDisconnect)
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import ValidationError

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

ControllerDepend = Annotated[Controller, Depends(Controller.get_instance)]

sockets: set[WebSocket] = set()
app: FastAPI = FastAPI(debug=True, mount=[
    Mount('/', StaticFiles(directory=FRONTEND, html=True))
])


@app.get('/{path}')
async def render_page(request: Request, path: str,
                      controller: ControllerDepend) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps(controller.model, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})


@app.get('/')
async def render_index(request: Request,
                       controller: ControllerDepend) -> Response:
    return await render_page(request, 'index.html', controller)


@app.websocket('/ws')
async def handle_websocket(websocket: WebSocket,
                           controller: ControllerDepend) -> None:
    await websocket.accept()
    sockets.add(websocket)
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
            action: Callable | None = controller.get_action(request['action'])
            if action is None:
                raise ValidationError(f'Action \'{request['action']}\' does '
                                      'not exist')

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
            await websocket.close(1007, message)
            sockets.remove(websocket)
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
