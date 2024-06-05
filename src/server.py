from roller_derby.series import Series
from roller_derby.encodable import ClientException
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse, FileResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from typing import Callable, Any, Awaitable, Collection
from datetime import datetime, timedelta, timezone
import inspect
import hashlib
import logging
import os
import socketio
import uvicorn

logging.basicConfig(
    format="{levelname}: {message}",
    datefmt="%m/%d/%Y %H:%M:%S",
    style="{",
    level=logging.INFO,
)


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

    def decorator(
        command: Callable[[dict[str, Any]], Any],
    ) -> Callable[[dict[str, Any]], Any]:
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
    data: dict[str, Any],
    to: None | str = None,
    room: None | str = None,
    skip: None | str = None,
    namespace: None | str = None,
) -> None:
    """Sends a Socket.IO message with the desired event name and data.

    Args:
        event (str): The name of the event to send.
        data (Any): The data payload.
        to (None | str, optional): The session ID to which to send the message.
        If None, the message is broadcast to all clients. Defaults to None.
        room (None | str, optional): The Socket.IO room to which to send the
        message. Defaults to None.
        skip (None | str, optional): The session ID which should be skipped in a
        broadcast. Allows the server to send a message to all clients in a group
        except for one. Defaults to None.
        namespace (None | str, optional): The Socket.IO namespace in which to
        send the message. Defaults to None.
        timestamp (None | int, optional): The server epoch at which the action
        originated. Defaults to None.
    """
    await _socket.emit(
        event, data, to=to, room=room, skip_sid=skip, namespace=namespace
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
    file: str = "index.html"
    if "file" in request.path_params:
        file = f"{request.path_params["file"]}"
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
    return FileResponse(f"{_webDir}/favicon.ico")


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


async def _dummyHandler(*_, **__) -> None:
    """A dummy function to handle miscellaneous Socket.IO API. This is needed to
    ensure that there aren't any argument exceptions with catch-all Socket.IO
    event handlers.
    """
    pass


async def _handleEvent(
    command: str, sessionId: str, json: dict[str, Any]
) -> dict[str, Any]:
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
    NOW: datetime = datetime.now(timezone.utc)
    log.debug(f"Handling event '{command}' with args: {json}.")
    response: dict[str, Any] = dict()
    try:
        # Validate the request payload has all the required JSON keys
        requiredKeys: tuple[str, ...] = (
            "method",
            "latency",
        )
        if not all(key in json for key in requiredKeys):
            raise ClientException("Invalid request payload.")

        # Validate the method is valid
        if not isinstance(json["method"], str):
            raise ClientException("Invalid method.")
        json["method"] = json["method"].lower()  # Ensure lowercase method

        # Validate the latency value is between 0 and 5 seconds
        if not isinstance(json["latency"], int) or 0 > json["latency"] > 5000:
            raise ClientException("Client latency is invalid")
        json["latency"] = timedelta(milliseconds=json["latency"])

        # Validate the command exists
        if command not in _commandTable:
            log.debug(f"The '{command}' handler does not exist.")
            raise ClientException(f"Unknown command '{command}'.")

        # Add the current timestamp and the session ID
        json["now"] = NOW
        json["session"] = sessionId

        # Get the function and call it with only the required arguments
        func: Callable[..., Awaitable[None | Collection]] = _commandTable[command]
        params: set[str] = set(
            [param.name for param in inspect.signature(func).parameters.values()]
        )
        json = {k: v for k, v in json.items() if k in params}
        data: None | Collection = await func(**json)

        # Build the response payload
        response["status"] = "ok"
        response["data"] = data
    except (Exception, ClientException) as e:
        # Return the exception and exception message
        response["status"] = "error"
        response["error"] = {
            "name": type(e).__name__,
            "message": str(e),
        }

        # If the exception was not caused by the client, log a traceback
        if not isinstance(e, ClientException) and (traceback := e.__traceback__):
            fileName: str = os.path.split(traceback.tb_frame.f_code.co_filename)[-1]
            lineNumber: int = traceback.tb_lineno
            log.error(f"{type(e).__name__}: {str(e)} ({fileName}, {lineNumber})")
    finally:
        # Return the current timestamp
        response["timestamp"] = str(datetime.now())
        log.debug(f"Ack: {str(response)}")
        return response


# The server logging instance
log: logging.Logger = logging.getLogger(__name__)

# The series manager which handles the game logic
bouts: Series = Series()

_commandTable: dict[str, Callable[..., Awaitable[None | Collection]]] = dict()
_socket: socketio.AsyncServer = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi"
)
_socket.on("connect", _handleConnect)
_socket.on("disconnect", _dummyHandler)
_socket.on("ping", _dummyHandler)
_socket.on("*", _handleEvent)

_webDir: str = "./build"  # The relative location of the built React files
_jinja: Jinja2Templates = Jinja2Templates(directory=_webDir)
_app: Starlette = Starlette(
    routes=[
        Route("/", _renderTemplate),
        Route("/favicon.ico", _serveFavicon),
        Mount("/static", app=StaticFiles(directory=f"{_webDir}/static"), name="static"),
        Mount("/socket.io", app=socketio.ASGIApp(_socket)),
        Route("/{file:str}", _renderTemplate),
    ],
)
