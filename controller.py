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
        self.server: None | WSGIServer = None
        self.port = port

    @property
    def port(self) -> int:
        return self._port

    @port.setter
    def port(self, port: int) -> None:
        port = int(port)
        if 1 > port > 65535:
            raise ValueError("port number is invalid")
        self._port = port

    def run(self) -> None:
        wsgi = socketio.WSGIApp(Controller.socket, Controller.flask)
        self.server = WSGIServer(("0.0.0.0", self.port), wsgi)
        self.server.serve_forever()
        self.server = None

    def stop(self) -> None:
        if self.server is not None:
            self.server.stop()


@Controller.socket.event
def sync(_):
    return Controller.monotonic()
