from server.view_model import controller, Queryable

async def serve(host: str = '0.0.0.0', port: int = 8000) -> None:
    from server.view import app
    import uvicorn

    # Configure and start the server
    config: uvicorn.Config = uvicorn.Config(app, host=host, port=port,
                                            log_config=None, access_log=False,
                                            log_level='warning')
    server: uvicorn.Server = uvicorn.Server(config)
    await server.serve()


def get_interfaces() -> list:
    raise NotImplementedError  # TODO: get list of interfaces available
