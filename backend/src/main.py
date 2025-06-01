import asyncio
import logging
from typing import Final

import server

HTTP_PORT: Final[int] = 80

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


if __name__ == '__main__':
    ip: str = server.get_ip_address()
    port: int = 8000
    print(f'Starting server at http://{ip}{f":{port}" if port != HTTP_PORT else ""}')
    asyncio.run(server.serve(port=port))
