from PySide6.QtCore import QRunnable, QObject, Signal
from gevent.pywsgi import WSGIServer
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from roller_derby import Bout
from flask import Flask, render_template
from types import TracebackType
from hashlib import md5
import socketio
import time
import os
import logging

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%m/%d/%Y %H:%M:%S",
    level=logging.DEBUG,
)
log: logging.Logger = logging.getLogger(__name__)


class Controller(QRunnable):
    __slots__ = "_port", "_server", "signals"

    flask: Flask = Flask(__name__)
    socket: socketio.Server = socketio.Server(async_handlers=False)
    bout: Bout = Bout()

    class Signals(QObject):
        running: Signal = Signal(bool)
        error: Signal = Signal()

    @staticmethod
    def monotonic() -> int:
        now = time.monotonic_ns()
        return round(now / 1_000_000)

    def __init__(self, port: int = 8000) -> None:
        super().__init__()
        self.setAutoDelete(False)
        self.signals: Controller.Signals = Controller.Signals()
        self._server: None | WSGIServer = None
        self.port = port

    @property
    def port(self) -> int:
        return self._port

    @port.setter
    def port(self, port: int) -> None:
        if not isinstance(port, int):
            raise TypeError(f"port must be int, not {type(port).__name__}")
        if not 1 <= port <= 65535:
            raise ValueError("port number is invalid")
        self._port: int = port

    def run(self) -> None:
        if self._server is not None:
            return  # only allow one instance to run at a time
        wsgi = socketio.WSGIApp(Controller.socket, Controller.flask)
        self._server = WSGIServer(("0.0.0.0", self.port), wsgi, log=None, error_log=log)
        try:
            self._server.start()
            self.signals.running.emit(True)
            self._server.serve_forever()
        except OSError:
            self.signals.error.emit()
        self._server = None
        self.signals.running.emit(False)

    def stop(self) -> None:
        log.info("NSO Bridge is shutting down.")
        self.socket.shutdown()
        if self._server is not None:
            self._server.stop()


@Controller.socket.event
def connect(sessionId, environ, auth):
    userId: str = auth["token"]
    if userId is None:  # TODO: or userId not in users
        userId: str = md5(str(environ.items()).encode()).hexdigest()
        Controller.socket.emit("userId", userId, to=sessionId)
    log.info(f"User '{userId}' has connected.")


@Controller.socket.event
def sync(_):
    return Controller.monotonic()


functionDictionary = {"print": print}  # TODO: find a better scope


@Controller.socket.on("*")
def sboEvent(event, _, data):
    response: dict = {"response": None}
    try:
        try:
            func = functionDictionary[event]
        except KeyError as e:
            raise NotImplementedError(f"Unknown command '{event}'.") from e
        args: list = data["args"] if "args" in data else []
        kwargs: dict = data["kwargs"] if "kwargs" in data else {}
        response["response"] = func(*args, **kwargs)
    except Exception as e:
        traceback: TracebackType = e.__traceback__
        response["error"] = {
            "type": "Exception",
            "name": type(e).__name__,
            "message": str(e),
            "file": os.path.split(traceback.tb_frame.f_code.co_filename)[-1],
            "lineNumber": traceback.tb_lineno,
        }
    # TODO: add ClientException to return a warning message, not a traceback
    finally:
        response["tick"] = Controller.monotonic()
    return response


@Controller.flask.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


if __name__ == "__main__":
    log.info("NSO Bridge is running in CLI mode.")
    controller: Controller = Controller(8000)
    Controller.flask.debug = True
    try:
        controller.run()
    except KeyboardInterrupt:
        controller.stop()
    log.info("NSO Bridge has successfully shut down.")
