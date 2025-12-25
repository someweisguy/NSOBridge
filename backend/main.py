import asyncio
import logging
import os
from pathlib import Path
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final, LiteralString

import ws
from core.dependencies import get_async_session_factory
from core.exceptions import RulesError
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from game import ROUTERS as GAME_ROUTERS
from game.rosters.models import Roster
from game.rulesets.wftda_2025 import Bout
from game.series.models import Series
from sqlalchemy import Result, Select, select
from users.router import router as user_router
from uvicorn import Config, Server

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Initialize the application and set the appropriate routes
PORT: Final[int] = int(os.environ.get('UVICORN_PORT', str(8000)))
FRONTEND: Final[Path] = Path(os.environ['VITE_BUILD_DIR'])
app: FastAPI = FastAPI(
    debug=True,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws.app),
    ],
)
API_PREFIX: LiteralString = '/api'
for router in [*GAME_ROUTERS, user_router]:
    app.include_router(router, prefix=API_PREFIX)


@app.get('/')
async def render_index() -> FileResponse:
    return FileResponse(FRONTEND / 'index.html')


@app.get('/sb')
async def render_generic(request: Request) -> FileResponse:
    return FileResponse(FRONTEND / (request.url.path[1:] + '.html'))


@app.exception_handler(RulesError)
async def rules_error_handler(request: Request, e: RulesError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={'message': str(e)},
    )


async def main(host: str = '0.0.0.0', port: int = 8000) -> None:
    # Create a Bout model if one does not already exist
    bout: Bout | None = None
    session_factory: async_sessionmaker = await get_async_session_factory()
    async with session_factory() as session, session.begin():
        statement: Select[tuple[Bout]] = select(Bout)
        results: Result[tuple[Bout]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout = Bout(
                Series(),
                Roster('Home', 'Default League'),
                Roster('Away', 'Default League'),
            )
            session.add(bout)
        await session.commit()

    # Configure the server
    server: Server = Server(
        Config(
            app,
            host=host,
            port=port,
            log_config=None,
            access_log=False,
            log_level='warning',
            server_header=False,
        )
    )

    # Log the server's address and serve the application
    try:
        with socket(AF_INET, SOCK_DGRAM) as sock:
            sock.connect(('1.1.1.1', 80))
            ip: str = sock.getsockname()[0]
    except OSError:
        ip = '127.0.0.1'
    HTTP_PORT: Final[int] = 80
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await server.serve()


if __name__ == '__main__':
    asyncio.run(main())
