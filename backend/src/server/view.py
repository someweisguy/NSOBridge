from fastapi import FastAPI, Request, WebSocket
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
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
    await controller.handle_websocket(websocket)
