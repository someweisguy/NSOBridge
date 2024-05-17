from roller_derby import Bout
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from types import TracebackType
from typing import Callable
import hashlib
import logging
import os
import socketio
import time
import uvicorn

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%m/%d/%Y %H:%M:%S",
    level=None,
)
log: logging.Logger = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)


def tick():
    now = time.monotonic_ns()
    return round(now / 1_000_000)


async def serve(port: int = 8000) -> None:
    if not isinstance(port, int):
        raise TypeError(f"port must be int, not {type(port).__name__}")
    if not 1 <= port <= 65535:
        raise ValueError("port number is invalid")
    config: uvicorn.Config = uvicorn.Config(app, host="0.0.0.0", port=port)
    server: uvicorn.Server = uvicorn.Server(config)
    try:
        await server.serve()
    except Exception:
        pass


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


async def homepage(request):
    with open("templates/index.html") as html:
        return HTMLResponse(html.read())


async def _connect(sessionId: str, environ: dict, auth: dict) -> None:
    userId: str = auth["token"]
    if userId is None:
        userId: str = hashlib.md5(str(environ.items()).encode()).hexdigest()
        await _socket.emit("userId", userId, to=sessionId)
    async with _socket.session(sessionId) as session:
        session["userId"] = userId


async def _disconnect(sessionId: str) -> None:
    pass


async def _sync(sessionId: str, *args, **kwargs) -> dict:
    millis: int = tick()
    return {"data": None, "tick": millis}


async def _event(command: str, sessionId: str, *args, **kwargs) -> dict:
    log.debug(f"Got command '{command}' with args {args}.")
    response: dict = {"data": None}
    try:
        if command not in _commandTable:
            log.debug(f"Command '{command}' does not exist.")
            raise NotImplementedError(f"Unknown command '{command}'.")
        func = _commandTable[command]
        response["data"] = func(None, *args, **kwargs)  # FIXME: None to Bout
    # TODO: add ClientException to return a warning message, not a traceback
    except Exception as e:
        response["error"] = {
            "name": type(e).__name__,
            "message": str(e),
        }
        traceback: None | TracebackType = e.__traceback__
        if isinstance(traceback, TracebackType):
            response["error"] |= {
                "file": os.path.split(traceback.tb_frame.f_code.co_filename)[-1],
                "lineNumber": traceback.tb_lineno,
            }
    response["tick"] = tick()
    return response


_commandTable: dict[str, Callable] = dict()
_socket: socketio.AsyncServer = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi"
)
app: Starlette = Starlette(
    debug=True,
    routes=[
        Route("/", homepage),
        Mount("/static", app=StaticFiles(directory="static"), name="static"),
        Mount("/socket.io", socketio.ASGIApp(_socket)),
    ],
)
_socket.on("connect", _connect)
_socket.on("disconnect", _disconnect)
_socket.on("sync", _sync)
_socket.on("*", _event)


if __name__ == "__main__":
    log.info("Starting NSO Bridge in CLI mode.")
    reload: bool = True
    if reload:
        log.warning("Server is running with reloader!")

    uvicorn.run(
        "controller:app",
        host="0.0.0.0",
        port=8000,
        log_level="warning",
        reload=True,
    )

    log.info("NSO Bridge has successfully shut down.")
