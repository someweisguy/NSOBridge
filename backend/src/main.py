import asyncio
import logging

import server

logging.basicConfig(
    format='{levelname}: {message}',
    datefmt='%m/%d/%Y %H:%M:%S',
    style='{',
    level=logging.INFO,
)


if __name__ == '__main__':
    print('Starting server...')
    asyncio.run(server.serve())
