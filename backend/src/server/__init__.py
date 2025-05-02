from uuid import UUID

from uvicorn import Config, Server

from server.fastapi import app

from .api.series import router as series_router

type JSONable = (
    int
    | float
    | str
    | bool
    | None
    | UUID
    | tuple[JSONable, ...]
    | list[JSONable]
    | dict[str, JSONable]
)

app.include_router(series_router, prefix='/api', tags=['series'])


def get_ip_addresses() -> list[str]:
    # TODO
    # import netifaces

    ip_addresses: list[str] = []
    # for interface in netifaces.interfaces():
    #     addresses = netifaces.ifaddresses(interface)
    #     if netifaces.AF_INET in addresses:
    #         ip_addresses += [
    #             item['addr']
    #             for item in addresses[netifaces.AF_INET]
    #             if item['addr'] != '127.0.0.1'
    #         ]
    return ip_addresses


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


__all__ = ('get_ip_addresses', 'serve')
