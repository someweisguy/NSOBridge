from socket import AF_INET, SOCK_DGRAM, socket

from uvicorn import Config, Server

from ._database import SessionFactory
from ._fastapi import app, shutdown, startup
from ._models import (
    CHILD_RELATIONSHIP,
    PARENT_RELATIONSHIP,
    BaseSQLModel,
    CacheableSQLModel,
    RulesError,
)
from ._schemas import ClientSchema, ServerSchema
from ._users import UserContext, UserDepends


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
    'BaseSQLModel',
    'CacheableSQLModel',
    'CHILD_RELATIONSHIP',
    'ClientSchema',
    'get_ip_address',
    'PARENT_RELATIONSHIP',
    'RulesError',
    'serve',
    'ServerSchema',
    'SessionFactory',
    'shutdown',
    'startup',
    'UserContext',
    'UserDepends',
)
