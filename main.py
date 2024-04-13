from PySide6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
from roller_derby import Bout, Timer
import PySide6.QtAsyncio as QtAsyncio
import sys

DEBUG_FLASK = False

bout = Bout()  # model
server = Flask(__name__)  # view
socketio = SocketIO(server)  # controller


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


@socketio.event
def sync():
    return Timer.monotonic()


@socketio.event
def getTimer():
    return bout.timers.game.serialize()


@socketio.event
def startGameTimer(timestamp):
    try:
        print("Starting timer")
        bout.timers.game.start(timestamp)
        socketio.emit("timer", bout.timers.game.serialize())
    except:
        pass


@socketio.event
def stopGameTimer(timestamp):
    try:
        print("Stopping timer")
        bout.timers.game.pause(timestamp)
        socketio.emit("timer", bout.timers.game.serialize())
    except:
        pass


class MainWindow(QMainWindow):
    # TODO: server port number, logging window, new/load button, link to index page, load a demo file

    def __init__(self) -> None:
        super().__init__()
        self.show()

        serverThread = Thread(
            target=socketio.run, args=(server, "0.0.0.0", 5000), daemon=True
        )
        serverThread.start()


if __name__ == "__main__":
    if DEBUG_FLASK:
        # Debug the Flask application without the Qt GUI
        socketio.run(
            server,
            host="0.0.0.0",
            port=5000,
            use_reloader=True,
            log_output=True,
            debug=True,
        )
    else:
        # Run the Flask application and Qt GUI on separate threads
        qApp = QApplication(sys.argv)
        mainWindow = MainWindow()
        QtAsyncio.run()
