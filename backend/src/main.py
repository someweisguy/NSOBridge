import asyncio
import logging
from typing import Final

from core import get_ip_address, serve

HTTP_PORT: Final[int] = 80

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


if __name__ == '__main__':
    ip: str = get_ip_address()
    port: int = 8000
    print(f'Starting server at http://{ip}{f":{port}" if port != HTTP_PORT else ""}')
    asyncio.run(serve(port=port))
