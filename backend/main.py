"""The injection point of the program."""

import asyncio
import logging
import os
from socket import AF_INET, SOCK_DGRAM, socket
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


async def main(*, host: str = '0.0.0.0', port: int = 8000) -> None:
    """Begin the program.

    Handles the configuration of the database, the API, the GUI, and then serves the
    app.

    Args:
        host (str, optional): The host IP address on which to serve the app. Defaults to
        '0.0.0.0'.
        port (int, optional): The port on which to serve the app. Defaults to 8000.

    """
    MAX_PORT_NUM: Final = 65535
    if 0 <= port > MAX_PORT_NUM:
        raise ValueError('Invalid port number')

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
    await ws.disconnect_all(CloseCode.GOING_AWAY, 'The server is shutting down')


if __name__ == '__main__':
    HOST: Final[str] = os.environ.get('UVICORN_HOST', '0.0.0.0')
    PORT: Final[int] = int(os.environ.get('UVICORN_PORT', str(8000)))

    asyncio.run(main(host=HOST, port=PORT))
