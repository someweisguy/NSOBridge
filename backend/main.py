import asyncio
import logging
import os
from pathlib import Path
from socket import AF_INET, SOCK_DGRAM, socket
from typing import Final, LiteralString

import models
import ws
from api import ROUTERS
from database import SessionFactory
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import Mount
from fastapi.staticfiles import StaticFiles
from game import RosterModel, SeriesModel
from game.exceptions import RulesError
from game.rulesets.wftda_2025 import BoutModel
from sqlalchemy import Result, Select, select
from uvicorn import Config, Server

PORT: int = 8000

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Initialize the application and set the appropriate routes
FRONTEND: Final[Path] = Path(os.environ['FRONTEND'])
app: FastAPI = FastAPI(
    debug=True,
    routes=[
        Mount('/assets', StaticFiles(directory=FRONTEND / 'assets')),
        Mount('/ws', ws.app),
    ],
)
API_PREFIX: LiteralString = '/api'
for router in ROUTERS:
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


async def main(net: str = '0.0.0.0', port: int = 8000) -> None:
    await models.create_all()

    # Create a Bout model if one does not already exist
    bout: BoutModel | None = None
    async with SessionFactory() as session, session.begin():
        statement: Select[tuple[BoutModel]] = select(BoutModel)
        results: Result[tuple[BoutModel]] = await session.execute(statement)
        if results.scalar() is None:
            print('Creating initial Bout model')
            bout = BoutModel(
                SeriesModel(),
                RosterModel('Home'),
                RosterModel('Away'),
            )
            session.add(bout)
        await session.commit()

    # Configure the server
    host: Server = Server(
        Config(
            app,
            host=net,
            port=port,
            log_config=None,
            access_log=False,
            log_level='warning',
        )
    )

    # Log the server's address and serve the application
    with socket(AF_INET, SOCK_DGRAM) as sock:
        sock.connect(('1.1.1.1', 80))
        ip: str = sock.getsockname()[0]
    HTTP_PORT: Final[int] = 80
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await host.serve()


if __name__ == '__main__':
    asyncio.run(main())
