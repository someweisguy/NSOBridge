from PySide6.QtCore import QRunnable, QObject, Signal
from gevent.pywsgi import WSGIServer
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from roller_derby import Bout
from flask import Flask, render_template
import socketio
import time


class Controller(QRunnable):
    __slots__ = "_port", "_server", "signals"

    flask: Flask = Flask(__name__)
    socket: socketio.Server = socketio.Server()
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
        self._server = WSGIServer(("0.0.0.0", self.port), wsgi, log=None)
        try:
            self._server.start()
            self.signals.running.emit(True)
            self._server.serve_forever()
        except OSError:
            self.signals.error.emit()
        self._server = None
        self.signals.running.emit(False)

    def stop(self) -> None:
        if self._server is not None:
            self._server.stop()


@Controller.socket.event
def sync(_):
    return Controller.monotonic()


@Controller.flask.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


if __name__ == "__main__":
    print("Running NSO Bridge controller without GUI")
    controller: Controller = Controller(8000)
    Controller.flask.debug = True
    try:
        controller.run()
    except KeyboardInterrupt:
        controller.stop()
