from PySide6.QtCore import QRunnable, QThreadPool
from PySide6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from roller_derby import Bout, Timer
import PySide6.QtAsyncio as QtAsyncio
import sys
from gevent import pywsgi
import socketio


class Server(QRunnable):
    def __init__(self, sio, flsk) -> None:
        super().__init__()
        self.app: socketio.WSGIApp = socketio.WSGIApp(sio, flsk)

    def run(self) -> None:
        wsgi = pywsgi.WSGIServer(("0.0.0.0", 8000), self.app)
        wsgi.serve_forever()


server = Flask(__name__)  # view
# socketio = Controller(Bout(), server)  # controller
socket = socketio.AsyncServer()
bout = Bout()


@socket.event
def sync():
    return Timer.monotonic()


@socket.event
def getTimer():
    return bout.timers.game.serialize()


@socket.event
async def startGameTimer(timestamp):
    try:
        print("Starting timer")
        bout.timers.game.start(timestamp)
        await socket.emit("timer", bout.timers.game.serialize())
    except:
        pass


@socket.event
async def stopGameTimer(timestamp):
    try:
        print("Stopping timer")
        bout.timers.game.pause(timestamp)
        await socket.emit("timer", bout.timers.game.serialize())
    except:
        pass


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


class MainWindow(QMainWindow):
    # TODO: server port number, logging window, new/load button, link to index page, load a demo file

    def __init__(self) -> None:
        super().__init__()
        self.show()
        serve = Server(socket, server)
        QThreadPool.globalInstance().start(serve)


if __name__ == "__main__":
    # Run the Flask application and Qt GUI on separate threads
    qApp = QApplication(sys.argv)
    mainWindow = MainWindow()
    QtAsyncio.run()
