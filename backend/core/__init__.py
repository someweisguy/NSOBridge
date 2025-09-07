from socket import AF_INET, SOCK_DGRAM, socket
from typing import LiteralString

from api.bout import router as get_router
from api.rules import router as rules_router
from uvicorn import Config, Server

from core.fastapi import app
from core.ws import broadcast

API_PREFIX: LiteralString = '/api'

for router in [get_router, rules_router]:
    app.include_router(router, prefix=API_PREFIX)


def get_ip_address() -> str:
    with socket(AF_INET, SOCK_DGRAM) as sock:
        sock.connect(('1.1.1.1', 80))
        return sock.getsockname()[0]


async def serve(ip: str = '0.0.0.0', port: int = 8000) -> None:
    config: Config = Config(
        app, host=ip, port=port, log_config=None, access_log=False, log_level='warning'
    )
    host: Server = Server(config)

    # Log the server's address and serve the application
    # TODO
    # addresses: list[str] = get_ip_addresses()
    # server.controller.log.info(f'Hosting Scoreboard on '
    #                            f'http://{addresses[0]}'
    #                            f'{f':{port}' if port != 80 else ''}')
    await host.serve()


__all__ = (
    'broadcast',
    'get_ip_address',
    'serve',
)
