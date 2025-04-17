import asyncio
import json
from uuid import UUID

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles

from .utils import CLIENT_ID_COOKIE_NAME, FRONTEND, TEMPLATES, ControllerDepend
from .websocket import clients, router

app: FastAPI = FastAPI(
    debug=True,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
    ],
    extra={'background_tasks': set()},
)
app.include_router(router)


@app.middleware('http')
async def update_views_middleware(request: Request, call_next) -> Response:
    response: Response = await call_next(request)

    if request.method != 'GET':
        background_tasks: set[asyncio.Task] = app.extra['background_tasks']
        client_id: UUID | None = request.cookies.get(CLIENT_ID_COOKIE_NAME)
        for socket in [s for u, s in clients.items() if u != client_id]:
            # Don't use a TaskGroup so the Response can be returned earlier
            task: asyncio.Task = asyncio.create_task(socket.send_json(response.body))
            background_tasks.add(task)  # Prevents task from being GC'd
            task.add_done_callback(background_tasks.discard)

    return response


@app.get('/')
async def render_index(request: Request, controller: ControllerDepend) -> Response:
    print('render_index called!')
    return await render_generic(request, 'index.html', controller)


@app.get('/{path}')
async def render_generic(
    request: Request, path: str, controller: ControllerDepend
) -> Response:
    if not path.endswith('.html'):
        return FileResponse(FRONTEND / path)
    data: str = json.dumps({}, separators=(',', ':'))
    return TEMPLATES.TemplateResponse(path, {'request': request, 'model': data})
