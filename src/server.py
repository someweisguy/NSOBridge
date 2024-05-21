from roller_derby.bout import SeriesManager, ClientException
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, FileResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from types import TracebackType
from typing import Callable, Any, Awaitable
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
    level=logging.INFO,
)


def getTick():
    """Gets the current server tick. The tick should be equivalent to number of
    milliseconds that the server has been online on most machines.

    Returns:
        int: The current server tick.
    """
    now = time.monotonic_ns()
    return round(now / 1_000_000)


async def serve(port: int, *, debug: bool = False) -> None:
    """Start and serve the scoreboard app on the specified port.

    Args:
        port (int): The port number to serve the scoreboard.
        debug (bool, optional): Turns on debug log messages. Defaults to False.

    Raises:
        TypeError: if the port number is is not an int or the debug arg is not a
        bool.
        ValueError: if the port number is not between 1 and 65535 (inclusive).
    """
    if not isinstance(port, int):
        raise TypeError(f"port must be int, not {type(port).__name__}")
    if not 1 <= port <= 65535:
        raise ValueError("port number is invalid")
    if not isinstance(debug, bool):
        raise TypeError(f"debug must be bool, not {type(port).__name__}")
    if debug:
        log.setLevel(logging.DEBUG)
    _app.debug = debug
    log.info(f"Starting NSO Bridge on port {port}")
    config: uvicorn.Config = uvicorn.Config(
        _app, host="0.0.0.0", port=port, log_level="critical"
    )
    server: uvicorn.Server = uvicorn.Server(config)
    await server.serve()
    log.info("NSO Bridge was successfully shut down.")


def register(
    command: None | Callable = None,
    *,
    name: str = "",
    overwrite: bool = False,
) -> Callable:
    """A decorator to register server command methods. Server command methods
    must not be asynchronous functions.

    Args:
        command (None | Callable, optional): The method to decorate. Defaults to
        None.
        name (str, optional): The to which to refer to the API. Defaults to the
        method name in Python.
        overwrite (bool, optional): Set to True to overwrite any currently
        registered method name. Methods which are overwritten without setting
        this flag to True will raise a LookupError exception. Defaults to False.

    Returns:
        Callable: The original method.
    """

    def decorator(command: Callable[[str, Any], Any]) -> Callable[[str, Any], Any]:
        commandName: str = name if name != "" else command.__name__
        if overwriting := (commandName in _commandTable) and not overwrite:
            raise LookupError(f"The command '{commandName}' is already registered.")
        gerund: str = "Adding" if not overwriting else "Overwriting"
        log.debug(f"{gerund} '{commandName}' command")
        _commandTable[commandName] = command
        return command

    return decorator(command) if callable(command) else decorator


async def emit(
    event: str,
    data: Any,
    to: None | str = None,
    room: None | str = None,
    skipSession: None | str = None,
    namespace: None | str = None,
    *,
    tick: int = getTick(),
) -> None:
    """Sends a Socket.IO message with the desired event name and data. Data is
    wrapped in a dictionary with the current server tick.

    Args:
        event (str): The name of the event to send.
        data (Any): The data payload.
        to (None | str, optional): The session ID to which to send the message.
        If None, the message is broadcast to all clients. Defaults to None.
        room (None | str, optional): The Socket.IO room to which to send the
        message. Defaults to None.
        skipSession (None | str, optional): The session ID which should be
        skipped in a broadcast. Allows the server to send a message to all
        clients in a group except for one. Defaults to None.
        namespace (None | str, optional): The Socket.IO namespace in which to
        send the message. Defaults to None.
        tick (int, optional): The server tick at which the action originated.
        Defaults to server.getTick().
    """
    payload: dict[str, Any] = {"data": data, "tick": tick}
    await _socket.emit(
        event, payload, to=to, room=room, skip_sid=skipSession, namespace=namespace
    )


async def _renderTemplate(request: Request) -> HTMLResponse:
    """Renders the HTML response using the Jinja2 templating engine. All HTML
    templates must be found in the `web/templates/` directory.

    Args:
        request (Request): The Request object received from the Starlette app.

    Returns:
        HTMLResponse: An HTML response rendered from the Jinja2 templating
        engine.
    """
    file: str = "html/index.html"
    if "file" in request.path_params:
        file = f"html/{request.path_params["file"]}"
    log.debug(f"Handling request for '{file}'.")
    return _jinja.TemplateResponse(request, file)


async def _serveFavicon(request: Request) -> FileResponse:
    """Serves the scoreboard favicon.

    Args:
        request (Request): The Request object received from the Starlette app.

    Returns:
        FileResponse: A Starlette file response of the favicon found in
        `web/static/favicon.ico`.
    """
    return FileResponse(f"{_webDir}/static/favicon.ico")


async def _handleConnect(
    sessionId: str, environ: dict[str, Any], auth: dict[str, Any]
) -> None:
    """Handles a socket.io connection event.

    Args:
        sessionId (str): The session ID of the corresponding connection.
        environ (dict): The web browser environment of the connection.
        auth (dict): The auth dictionary from the connection.
    """
    userId: str = auth["token"]
    if userId is None:
        userId: str = hashlib.md5(str(environ.items()).encode()).hexdigest()
        await _socket.emit("userId", userId, to=sessionId)
    async with _socket.session(sessionId) as session:
        session["userId"] = userId


async def _handleDisconnect(sessionId: str) -> None:
    """Handles a socket.io disconnection event.

    Args:
        sessionId (str): The session ID of the corresponding connection.
    """
    pass


async def _sync(sessionId: str, *args, **kwargs) -> dict:
    """Handles a socket.io sync event. Returns an empty response with the
    current server tick. Used to synchronize clients with the server.

    Args:
        sessionId (str): The session ID of the corresponding connection.

    Returns:
        dict: A dictionary with the current server tick.
    """
    tick: int = getTick()
    return {"data": None, "tick": tick}


async def _handleEvent(command: str, sessionId: str, *args, **kwargs) -> dict:
    """Handles all socket.io events except for connection, disconnection, and
    sync. This handler looks up the received command in a command table and
    calls the appropriate function, if it exists.

    If an exception occurs while handling a command, the traceback is logged
    using the server logger instance. If the exception was a ClientException,
    the error message is returned to the client.

    Args:
        command (str): The name of the command to call.
        sessionId (str): The session ID of the corresponding connection.

    Returns:
        dict: A dictionary of the command response.
    """
    log.debug(f"Handling event '{command}' with args: {args}.")
    response: dict[str, Any] = dict()
    try:
        if command not in _commandTable:
            log.debug(f"The '{command}' handler does not exist.")
            raise ClientException(f"Unknown command '{command}'.")
        func: Callable[[Any, Any], Awaitable[Any]] = _commandTable[command]
        response["data"] = await func(sessionId, *args)
    except (Exception, ClientException) as e:
        response["error"] = {
            "name": type(e).__name__,
            "message": str(e),
        }
        traceback: None | TracebackType = e.__traceback__
        if not isinstance(e, ClientException) and traceback is not None:
            fileName: str = os.path.split(traceback.tb_frame.f_code.co_filename)[-1]
            lineNumber: int = traceback.tb_lineno
            log.error(f"{type(e).__name__}: {str(e)} ({fileName}, {lineNumber})")
    response["tick"] = getTick()
    return response


log: logging.Logger = logging.getLogger(__name__)
bouts: SeriesManager = SeriesManager()

_commandTable: dict[str, Callable[[Any, Any], Awaitable[Any]]] = dict()
_socket: socketio.AsyncServer = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi"
)
_socket.on("connect", _handleConnect)
_socket.on("disconnect", _handleDisconnect)
_socket.on("sync", _sync)
_socket.on("*", _handleEvent)

_webDir: str = "./web"
_jinja: Jinja2Templates = Jinja2Templates(directory=f"{_webDir}/templates")
_app: Starlette = Starlette(
    routes=[
        Route("/", _renderTemplate),
        Route("/favicon.ico", _serveFavicon),
        Mount("/static", app=StaticFiles(directory=f"{_webDir}/static"), name="static"),
        Mount("/socket.io", app=socketio.ASGIApp(_socket)),
        Route("/{file:str}", _renderTemplate),
    ],
)
