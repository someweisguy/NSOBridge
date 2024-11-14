async def serve(host: str = '0.0.0.0', port: int = 8000) -> None:
    from .view import view
    import uvicorn

    config: uvicorn.Config = uvicorn.Config(view, host=host, port=port,
                                            log_config=None, access_log=False,
                                            log_level='warning')
    server: uvicorn.Server = uvicorn.Server(config)
    await server.serve()


def get_interfaces() -> list:
    raise NotImplementedError  # TODO: get list of interfaces available
