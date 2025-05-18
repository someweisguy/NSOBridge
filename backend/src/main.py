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
    ip: str = server.get_ip_address()
    port: int = 8000
    print(f'Starting server at {ip}{f':{port}' if port != 80 else ''}')
    asyncio.run(server.serve(port=port))
