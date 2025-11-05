from socket import AF_INET, SOCK_DGRAM, socket

from uvicorn import Config, Server

from .fastapi import app
from .history import UserContext, UserDepends
from .schemas import ClientSchema, ServerSchema
from .ws import broadcast


def get_ip_address() -> str:
    with socket(AF_INET, SOCK_DGRAM) as sock:
        sock.connect(('1.1.1.1', 80))
        return sock.getsockname()[0]


async def serve(ip: str = '0.0.0.0', port: int = 8000) -> None:
    config: Config = Config(
        app, host=ip, port=port, log_config=None, access_log=False, log_level='warning'
    )
    host: Server = Server(config)

    # TODO: Log the server's address and serve the application
    await host.serve()


__all__ = (
    'app',
    'broadcast',
    'ClientSchema',
    'get_ip_address',
    'serve',
    'ServerSchema',
    'UserContext',
    'UserDepends',
)
