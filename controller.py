from PySide6.QtCore import QRunnable
from gevent.pywsgi import WSGIServer
from roller_derby import Bout
from flask import Flask
import socketio


class Controller(QRunnable):
    flask: Flask = Flask(__name__)
    socket: socketio.Server = socketio.Server()
    bout: Bout = Bout()

    def __init__(self, port: int) -> None:
        if not isinstance(port, int):
            raise TypeError()
        if 1 > port > 65535:
            raise ValueError()
        super().__init__()
        self.server: None | WSGIServer = None
        self.port = port

    def run(self) -> None:
        wsgi = socketio.WSGIApp(Controller.socket, Controller.flask)
        self.server = WSGIServer(("0.0.0.0", self.port), wsgi)
        self.server.serve_forever()

    def stop(self) -> None:
        if self.server is not None:
            self.server.stop()


@Controller.socket.event
def sync():
    return 1  # TODO
