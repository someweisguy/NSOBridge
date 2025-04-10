import json
import os
import traceback
from datetime import datetime
from json import JSONDecodeError
from pathlib import Path
from typing import Annotated, Any, Final

from fastapi import (
    Depends,
    FastAPI,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import ValidationError

from controller import Controller

SOCKET_PROTOCOL: Final[str] = 'nso-bridge'

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

ControllerDepend = Annotated[Controller, Depends(Controller.get_instance)]

sockets: set[WebSocket] = set()
app: FastAPI = FastAPI(
    debug=True, mount=[Mount('/', StaticFiles(directory=FRONTEND, html=True))]
)


@app.get('/{path}')
async def render_generic(
    request: Request, path: str, controller: ControllerDepend
) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps(controller.model, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})


@app.get('/')
async def render_index(request: Request, controller: ControllerDepend) -> Response:
    return await render_generic(request, 'index.html', controller)


@app.websocket('/ws')
async def handle_websocket(websocket: WebSocket, controller: ControllerDepend) -> None:
    await websocket.accept(subprotocol=SOCKET_PROTOCOL)
    sockets.add(websocket)

    while True:
        try:
            # Parse the JSON payload
            request: dict[str, Any] = await websocket.receive_json()
            received_on: datetime = datetime.now()

            # Ensure that the payload has the required keys
            if not all(
                key in request.keys()
                for key in ('action', 'args', 'clientId', 'transactionId')
            ):
                raise JSONDecodeError('Missing payload key.')

            # Assemble the response object
            response: dict[str, Any] = {
                'clientId': request['clientId'],
                'transactionId': request['transactionId'],
                'received': received_on,
            }

            # Handle the client request
            response['data'] = controller.handle_client(
                request['action'], request['args']
            )
            response['result'] = 'ok'

        except (WebSocketDisconnect, JSONDecodeError) as e:
            if isinstance(e, JSONDecodeError):
                await websocket.close(1003, 'Invalid JSON payload.')
            break
        except (ValidationError, Exception) as e:
            tb = traceback.extract_tb(e.__traceback__)
            response['data'] = {
                'title': type(e).__name__,
                'detail': str(e),
                'filename': os.path.basename(tb[-1].filename),
                'lineno': tb[-1].lineno,
            }
            response['result'] = 'error'
        
        response['sent'] = datetime.now()
        await websocket.send_json(jsonable_encoder(response))

        # Broadcast updates to all clients
        for update in controller.get_updates():
            pass  # TODO
        controller.clear_updates()

    sockets.remove(websocket)
