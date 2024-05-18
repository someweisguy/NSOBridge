from roller_derby import BoutManager, ClientException
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import FileResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from types import TracebackType
from typing import Callable
import hashlib
import logging
import os
import socketio
import time
import uvicorn

logging.basicConfig(
    format="{levelname}: {message}",
    datefmt="%m/%d/%Y %H:%M:%S",
    style="{",
    level=None,
)


def getTick():
    now = time.monotonic_ns()
    return round(now / 1_000_000)


async def serve(port: int = 8000, *, debug: bool = False) -> None:
    if not isinstance(port, int):
        raise TypeError(f"port must be int, not {type(port).__name__}")
    if not 1 <= port <= 65535:
        raise ValueError("port number is invalid")
    if debug:
        log.setLevel(logging.DEBUG)
    app.debug = debug
    log.info(f"Starting NSO Bridge on port {port}")
    config: uvicorn.Config = uvicorn.Config(
        app, host="0.0.0.0", port=port, log_level="critical"
    )
    server: uvicorn.Server = uvicorn.Server(config)
    await server.serve()
    log.info("NSO Bridge was successfully shut down.")


def register(
    command: None | Callable = None, *, name: str = "", overwrite: bool = False
) -> Callable:
    def decorator(command: Callable) -> Callable:
        commandName: str = name if name != "" else command.__name__
        if overwriting := (commandName in _commandTable) and not overwrite:
            raise LookupError(f"The command {commandName} is already registered.")
        if overwriting:
            log.debug(f"Overwriting '{commandName}' command")
        else:
            log.debug(f"Adding '{commandName}' command")
        _commandTable[commandName] = command
        return command

    return decorator(command) if callable(command) else decorator


async def _renderTemplate(request: Request):
    file: str = "index.html"
    if "file" in request.path_params:
        file = request.path_params["file"]
        if file == "favicon.ico":
            return FileResponse("static/favicon.ico")
    return _jinja.TemplateResponse(request, file)


async def _handleConnect(sessionId: str, environ: dict, auth: dict) -> None:
    userId: str = auth["token"]
    if userId is None:
        userId: str = hashlib.md5(str(environ.items()).encode()).hexdigest()
        await _socket.emit("userId", userId, to=sessionId)
    async with _socket.session(sessionId) as session:
        session["userId"] = userId


async def _handleDisconnect(sessionId: str) -> None:
    pass


async def _sync(sessionId: str, *args, **kwargs) -> dict:
    tick: int = getTick()
    return {"data": None, "tick": tick}


async def _handleEvent(command: str, sessionId: str, *args, **kwargs) -> dict:
    log.debug(f"Handling event '{command}' with args: {args}.")
    response: dict = {"data": None}
    try:
        if command not in _commandTable:
            log.debug(f"The '{command}' handler does not exist.")
            raise ClientException(f"Unknown command '{command}'.")
        func = _commandTable[command]
        response["data"] = func(*args)
    except (Exception, ClientException) as e:
        response["tick"] = getTick()
        response["error"] = {
            "name": type(e).__name__,
            "message": str(e),
        }
        traceback: None | TracebackType = e.__traceback__
        if not isinstance(e, ClientException) and traceback is not None:
            fileName: str = os.path.split(traceback.tb_frame.f_code.co_filename)[-1]
            lineNumber: int = traceback.tb_lineno
            log.error(f"{type(e).__name__}: {str(e)} ({fileName}, {lineNumber})")
    return response


_jinja = Jinja2Templates(directory="templates")

_socket: socketio.AsyncServer = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi"
)
_socket.on("connect", _handleConnect)
_socket.on("disconnect", _handleDisconnect)
_socket.on("sync", _sync)
_socket.on("*", _handleEvent)

_commandTable: dict[str, Callable] = dict()

log: logging.Logger = logging.getLogger(__name__)
game: BoutManager = BoutManager()
app: Starlette = Starlette(
    routes=[
        Route("/", _renderTemplate),
        Mount("/static", app=StaticFiles(directory="static"), name="static"),
        Mount("/socket.io", app=socketio.ASGIApp(_socket)),
        Route("/{file:str}", _renderTemplate),
    ],
)


if __name__ == "__main__":
    import asyncio

    asyncio.run(serve(8000, debug=True))
