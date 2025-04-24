import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Final

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server import updater

from .api.series import router as series_router

FRONTEND: Final[Path] = Path(os.getcwd()) / 'frontend' / 'dist'
TEMPLATES: Final[Jinja2Templates] = Jinja2Templates(FRONTEND)

CLIENT_ID_COOKIE_NAME: Final[str] = 'client_id'


class CustomJSONResponse(JSONResponse):
    def __init__(
        self, content, status_code=200, headers=None, media_type=None, background=None
    ):
        self._timestamp: Final[datetime] = datetime.now()
        super().__init__(content, status_code, headers, media_type, background)

    def render(self, content: Any) -> bytes:
        return json.dumps(
            {
                'success': self.status_code == 200,
                'data': content,
                'timestamp': self._timestamp.isoformat(),
            },
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
        ).encode('utf-8')


app: FastAPI = FastAPI(
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', updater.app),
    ],
    debug=True,
)

app.include_router(series_router, prefix='/api')


@app.get('/')
async def render_index(request: Request) -> Response:
    print('render_index called!')
    return await render_generic(request, 'index.html')


@app.get('/{path}')
async def render_generic(request: Request, path: str) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps({}, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})


@app.get('/api/serverSync')
async def server_sync(request: Request) -> Response:
    start: datetime = datetime.now()
    data: dict = {
        't1': start.isoformat(),
        't2': datetime.now().isoformat(),
    }
    return CustomJSONResponse(data)


@app.middleware('http')
async def handle_ws_updates(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    if request.method != 'GET':
        updater.broadcast()
    return response
