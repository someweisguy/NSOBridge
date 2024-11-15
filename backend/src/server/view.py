from typing import Any
from fastapi import FastAPI, Request, WebSocket
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from .controller import Controller
from . import controller
import os


frontend: Path = Path(os.getcwd()) / 'frontend' / 'dist'
view: FastAPI = FastAPI(debug=True, routes=[
    Mount('/assets', StaticFiles(directory=frontend / 'assets'))],
    templates=Jinja2Templates(frontend),
)


@view.get("/")
async def index(request: Request):
    templates: Jinja2Templates = view.extra['templates']
    data: dict[str | float | int, Any] = controller.model.data.get_data()
    return templates.TemplateResponse("index.html", {'request': request,
                                                     'series': data})


@view.websocket('/ws')
async def ws(websocket: WebSocket):
    await controller.handle_websocket(websocket)
