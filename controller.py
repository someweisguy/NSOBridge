from PySide6.QtCore import QRunnable
from gevent.pywsgi import WSGIServer
from roller_derby import Bout
from flask import Flask
import socketio
import time


class Controller(QRunnable):
    flask: Flask = Flask(__name__)
    socket: socketio.Server = socketio.Server()
    bout: Bout = Bout()

    @staticmethod
    def monotonic() -> int:
        now = time.monotonic_ns()
        return round(now / 1_000_000)

    def __init__(self, port: int = 8000) -> None:
        super().__init__()
        self._server: None | WSGIServer = None
        self.port = port

    @property
    def port(self) -> int:
        return self._port

    @port.setter
    def port(self, port: int) -> None:
        if not isinstance(port, int):
            raise TypeError(f"port must be int, not {type(port).__name__}")
        if 1 > port > 65535:
            raise ValueError("port number is invalid")
        self._port: int = port

    @property
    def is_running(self) -> bool:
        return self._server is not None

    def run(self) -> None:
        if self.is_running:
            return  # only allow one instance to run at a time
        wsgi = socketio.WSGIApp(Controller.socket, Controller.flask)
        self._server = WSGIServer(("0.0.0.0", self.port), wsgi)
        try:
            self._server.serve_forever()
        except OSError:
            pass  # suppress errors outside of main thread
        self._server = None

    def stop(self) -> None:
        if self._server is not None:
            self._server.stop()


@Controller.socket.event
def sync(_):
    return Controller.monotonic()
