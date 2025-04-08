import json
import os
import traceback
from json import JSONDecodeError
from pathlib import Path
from typing import Annotated, Any, Callable, Final
from datetime import datetime

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
async def render_generic(request: Request, path: str,
                         controller: ControllerDepend) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps(controller.model, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})


@app.get('/')
async def render_index(request: Request,
                       controller: ControllerDepend) -> Response:
    return await render_generic(request, 'index.html', controller)        


@app.websocket('/ws')
async def handle_websocket(websocket: WebSocket,
                           controller: ControllerDepend) -> None:
    await websocket.accept()
    sockets.add(websocket)

    disconnect_code: int = 1006
    disconnect_message: str = 'An unexpected error occurred.'
    while True:
        try:
            # Parse the JSON payload
            request: dict[str, Any] = await websocket.receive_json()

            # Ensure that the payload has the required keys
            if not all(key in request.keys() for key in
                       ('action', 'args', 'clientId', 'transactionId')):
                raise ValidationError('Missing payload key.')
            
            # Handle the client request
            response = controller.handle_client(request['action'],
                                                request['args'])

            # Construct and send the response payload
            response: dict[str, Any] = {
                'data': response,
                'transactionId': request['transactionId'],
                'clientId': request['clientId'],
                'result': 'ok',
            }
            await websocket.send_json(response)
            
            # Broadcast updates to all clients
            for update in controller.get_updates():
                pass  # TODO
            controller.clear_updates()
            
        except (WebSocketDisconnect, JSONDecodeError, ValidationError) as e:
            match e:
                case WebSocketDisconnect():
                    disconnect_code = 1000
                    disconnect_message = 'WebSocket disconnected.'
                case JSONDecodeError():
                    disconnect_code = 1003
                    disconnect_message = 'Invalid JSON payload.'
                case ValidationError():
                    disconnect_code = 1008
                    disconnect_message = 'Invalid payload schema.'
            break
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

    sockets.remove(websocket)
    await websocket.close(disconnect_code, disconnect_message)
