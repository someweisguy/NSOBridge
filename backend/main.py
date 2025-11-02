import asyncio
import logging
from typing import Final, LiteralString

import core
from api.api import router as history_router
from api.bout import router as bout_router
from api.jam import router as jam_router
from api.roster import router as roster_router
from api.series import router as series_router

PORT: int = 8000

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Attach the API to the server
API_PREFIX: LiteralString = '/api'
# TODO: generate a list of routers in the API module and import it here
for router in [bout_router, series_router, roster_router, history_router, jam_router]:
    core.app.include_router(router, prefix=API_PREFIX)


async def main() -> None:
    HTTP_PORT: Final[int] = 80
    ip: str = core.get_ip_address()
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
