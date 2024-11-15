from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from json import JSONDecodeError
from pathlib import Path
from server.controller import controller
from typing import Any
import os


build_dir: Path = Path(os.getcwd()) / 'frontend' / 'dist'
app: FastAPI = FastAPI(debug=True, routes=[
    Mount('/assets', StaticFiles(directory=build_dir / 'assets'))],
    templates=Jinja2Templates(build_dir),
)


@app.get("/")
async def index(request: Request):
    templates: Jinja2Templates = app.extra['templates']
    data: dict[str | float | int, Any] = controller.data.get_data()
    return templates.TemplateResponse("index.html", {'request': request,
                                                     'series': data})


@app.websocket('/ws')
async def ws(websocket: WebSocket):
    await controller.connect(websocket)
    socket_is_connected: bool = True
    while socket_is_connected:
        try:
            # Parse the JSON payload
            request: dict[str, Any] = await websocket.receive_json()

            # Ensure that the payload has the required keys
            if not all(key in {'action', 'args', 'transactionId'}
                       for key in request.keys()):
                raise UserWarning('Missing payload key.')

            # Begin to construct the response payload
            response: dict[str, Any] = {
                'transactionId': request['transactionId']
            }

            # Validate the desired action is defined
            if request['action'] not in controller.actions.keys():
                raise UserWarning(f'No such action '
                                  f'\'{request['action']}\'.')

            # Call the desired API function and return the result
            response['data'] = controller.actions[request['action']](
                **request['args'])
            await websocket.send_json(response)

        except JSONDecodeError:
            pass  # TODO
        except UserWarning:
            pass  # TODO
        except WebSocketDisconnect:
            socket_is_connected = False  # TODO
        except Exception:
            pass  # TODO
        finally:
            notifications: list[dict] = controller.get_notifications()
            if len(notifications) > 0:
                await controller.broadcast(notifications)
                controller.clear_notifications()

    await controller.disconnect(websocket)
