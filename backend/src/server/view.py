from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from json import JSONDecodeError
from pathlib import Path
from server.view_model import controller
from typing import Any
import json
import os


build_dir: Path = Path(os.getcwd()) / 'frontend' / 'dist'
app: FastAPI = FastAPI(debug=True, routes=[
    Mount('/assets', StaticFiles(directory=build_dir / 'assets'))],
    templates=Jinja2Templates(build_dir),
)


@app.get('/')
async def index(request: Request):
    templates: Jinja2Templates = app.extra['templates']
    data: str = json.dumps(controller.data.get(), separators=(',', ':'))
    return templates.TemplateResponse('index.html', {'request': request,
                                                     'model': data})


@app.websocket('/ws')
async def ws(websocket: WebSocket):
    await controller.connect(websocket)
    socket_is_connected: bool = True
    while socket_is_connected:
        try:
            # Parse the JSON payload
            request: dict[str, Any] = await websocket.receive_json()

            # Ensure that the payload has the required keys
            if not all(key in {'module', 'method', 'transactionId'}
                       for key in request.keys()):
                raise UserWarning('Missing payload key.')

            # Begin to construct the response payload
            response: dict[str, Any] = {
                'transactionId': request['transactionId']
            }

            # Validate the desired action is defined
            if not controller.action_exists(request['module'],
                                            request['method']):
                raise KeyError(f'Action '
                               f'\'{request['module'].request['method']}\' '
                               f'does not exist')

            # Call the desired API function and return the result
            response['data'] = controller.call(request['module'],
                                               request['action'],
                                               request['args'])
            response['result'] = 'ok'

        except WebSocketDisconnect:
            await controller.disconnect(websocket, 1000, 'Client disconnected')
            socket_is_connected = False
        except JSONDecodeError:
            await controller.disconnect(websocket, 1007, 'JSON decode error')
            socket_is_connected = False
        except UserWarning:
            await controller.disconnect(websocket, 1007, 'Invalid payload')
            socket_is_connected = False
        except (KeyError | Exception) as e:
            response['result'] = 'error'
            response['data'] = {'title': type(e).__name__, 'detail': str(e)}
        finally:
            if socket_is_connected:
                await websocket.send_json(response)

            notifications: list[dict] = controller.get_notifications()
            if len(notifications) > 0:
                await controller.broadcast(notifications)
                controller.clear_notifications()
