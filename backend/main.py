import asyncio
import logging
from typing import Final, LiteralString

import core
from api import ROUTERS

PORT: int = 8000

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


# Attach the API to the server
API_PREFIX: LiteralString = '/api'
for router in ROUTERS:
    core.app.include_router(router, prefix=API_PREFIX)


async def main() -> None:
    HTTP_PORT: Final[int] = 80
    ip: str = core.get_ip_address()
    print(f'Starting server at http://{ip}{f":{PORT}" if PORT != HTTP_PORT else ""}')
    await core.serve(port=PORT)


if __name__ == '__main__':
    asyncio.run(main())
