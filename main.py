from PySide6.QtCore import QRunnable, QThreadPool
from PySide6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from roller_derby import Bout, Timer
import PySide6.QtAsyncio as QtAsyncio
import sys


class Controller(QRunnable):
    socket: SocketIO = SocketIO()
    _port: int = 8000
    model: None | Bout = None
    view: None | Flask = None

    def __init__(self, model: Bout, view: Flask):
        if Controller.model is not None and Controller.view is not None:
            raise RuntimeError("only one controller can be initialized")
        super().__init__()
        Controller.model = model
        Controller.view = view

    @property
    def port(self) -> int:
        return Controller.port

    @port.setter
    def port(self, value: int) -> None:
        if 1 > value > 65535:
            raise ValueError("port must be between 0 and 65535")
        Controller.port = value

    def run(self):
        Controller.socket.init_app(self.view)
        Controller.socket.run(self.view, "0.0.0.0", Controller.port)

    @socket.event
    def sync():
        return Timer.monotonic()

    @socket.event
    def getTimer():
        return Controller.model.timers.game.serialize()

    @socket.event
    def startGameTimer(timestamp):
        try:
            print("Starting timer")
            Controller.model.timers.game.start(timestamp)
            Controller.socket.emit("timer", Controller.model.timers.game.serialize())
        except:
            pass

    @socket.event
    def stopGameTimer(timestamp):
        try:
            print("Stopping timer")
            Controller.model.timers.game.pause(timestamp)
            Controller.socket.emit("timer", Controller.model.timers.game.serialize())
        except:
            pass


server = Flask(__name__)  # view
socketio = Controller(Bout(), server)  # controller


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


class MainWindow(QMainWindow):
    # TODO: server port number, logging window, new/load button, link to index page, load a demo file

    def __init__(self) -> None:
        super().__init__()
        self.show()
        QThreadPool.globalInstance().start(socketio)


if __name__ == "__main__":
    # Run the Flask application and Qt GUI on separate threads
    qApp = QApplication(sys.argv)
    mainWindow = MainWindow()
    QtAsyncio.run()
