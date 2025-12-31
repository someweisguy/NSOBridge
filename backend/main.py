#!/usr/bin/env python3
"""The injection point of the program."""

import asyncio
import logging
import os
from typing import TYPE_CHECKING, Final

import core
import game
import user
import ws
from game import Roster, Series, wftda_2025
from sqlalchemy import Result, Select, select
from websockets import CloseCode

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import async_sessionmaker


logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


async def main(*, host: str, port: int) -> None:
    """Begin the program.

    Handles the configuration of the database, the API, the GUI, and then serves the
    app.

    Args:
        host (str): The host IP address on which to serve the app.
        port (int): The port on which to serve the app.

    """
    print(f'Connecting to Database in: {core.db.path}')
    await core.db.create_all()

    # Create a Bout model if one does not already exist
    session_factory: async_sessionmaker = core.db.get_async_session_factory()
    async with session_factory() as session, session.begin():
        statement: Select[tuple[wftda_2025.Bout]] = select(wftda_2025.Bout)
        results: Result[tuple[wftda_2025.Bout]] = await session.execute(statement)
        if results.scalar_one_or_none() is None:
            print('Creating initial Bout model')
            bout = wftda_2025.Bout(
                Series(),
                Roster('Home', 'Default League'),
                Roster('Away', 'Default League'),
            )
            session.add(bout)
        await session.commit()

    # Load the server API and the WebSocket application
    core.app.mount('/ws', ws.app)
    for router in [*game.routers, user.router]:
        core.app.include_router(router, prefix='/api')

    # Log the server's address and serve the application
    http_port: Final[int] = 80
    print(f'Starting server at http://{host}{f":{port}" if port != http_port else ""}')

    await core.run(host, port)
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')


if __name__ == '__main__':
    HOST: Final[str] = os.environ['UVICORN_HOST']
    PORT: Final[int] = int(os.environ['UVICORN_PORT'])

    asyncio.run(main(host=HOST, port=PORT))
