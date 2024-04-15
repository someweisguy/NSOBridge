from PySide6.QtCore import QRunnable, QThreadPool
from PySide6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from roller_derby import Bout, Timer
import PySide6.QtAsyncio as QtAsyncio
import sys
from gevent import pywsgi
import socketio


server = Flask(__name__)  # view
socket = socketio.Server()
bout = Bout()


@socket.event
def sync(_):
    return Timer.monotonic()


@socket.event
def getTimer(_):
    return bout.timers.game.serialize()


@socket.event
def startGameTimer(_, timestamp):
    try:
        print("Starting timer")
        bout.timers.game.start(timestamp)
        socket.emit("timer", bout.timers.game.serialize())
    except:
        pass


@socket.event
def stopGameTimer(_, timestamp):
    try:
        print("Stopping timer")
        bout.timers.game.pause(timestamp)
        socket.emit("timer", bout.timers.game.serialize())
    except:
        pass


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


class WSGIServer(QRunnable):
    def __init__(self, sio: socketio.AsyncServer, flsk: Flask) -> None:
        super().__init__()
        self.app: socketio.WSGIApp = socketio.WSGIApp(sio, flsk)

    def run(self) -> None:
        self._wsgi = pywsgi.WSGIServer(("0.0.0.0", 8000), self.app)
        self._wsgi.serve_forever()

    def stop(self) -> None:
        self._wsgi.stop()


class MainWindow(QMainWindow):
    # TODO: server port number, link to index page

    def __init__(self) -> None:
        super().__init__()
        self.show()
        wsgi = WSGIServer(socket, server)
        QThreadPool.globalInstance().start(wsgi)
        print("started")
        # import time
        # time.sleep(5)
        # wsgi.stop()
        # print("stopped")


if __name__ == "__main__":
    # Run the Flask application and Qt GUI on separate threads
    qApp = QApplication(sys.argv)
    mainWindow = MainWindow()
    QtAsyncio.run()
