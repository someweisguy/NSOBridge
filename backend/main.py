import asyncio
import logging
import os
from socket import AF_INET, SOCK_DGRAM, socket
from typing import TYPE_CHECKING, Final

import core
from core.models import BaseSQLModel
from core.service import EngineManager
from game import ROUTERS as game_routers
from game.rosters.models import Roster
from game.rulesets.wftda_2025 import Bout
from game.series.models import Series
from sqlalchemy import Result, Select, select
from users.router import router as user_router

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


async def main(*, host: str = '0.0.0.0', port: int = 8000) -> None:
    db: EngineManager = EngineManager(BaseSQLModel)
    print(f'Connecting to Database in: {db.path}')
    await db.create_all()

    # Create a Bout model if one does not already exist
    bout: Bout | None = None
    session_factory: async_sessionmaker = db.get_async_session_factory()
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

    # Load the server API
    for router in [*game_routers, user_router]:
        core.load_api(router)

    # Log the server's address and serve the application
    # TODO: Strictly speaking, we should cross-check this against the host
    try:
        with socket(AF_INET, SOCK_DGRAM) as sock:
            sock.connect(('1.1.1.1', 80))
            ip: str = sock.getsockname()[0]
    except OSError:
        ip = '127.0.0.1'
    HTTP_PORT: Final[int] = 80
    print(f'Starting server at http://{ip}{f":{port}" if port != HTTP_PORT else ""}')

    await core.run(host, port)


if __name__ == '__main__':
    HOST: Final[str] = os.environ.get('UVICORN_HOST', '0.0.0.0')
    PORT: Final[int] = int(os.environ.get('UVICORN_PORT', str(8000)))

    asyncio.run(main(host=HOST, port=PORT))
