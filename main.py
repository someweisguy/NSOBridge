from PyQt6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from flask_socketio import SocketIO, send
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
import sys
from roller_derby import Bout, Timer
import json

DEBUG_FLASK = True

server = Flask(__name__)
socketio = SocketIO(server)
bout = Bout()


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


@socketio.event
def sync():
    return Timer.current_time()

@socketio.event
def getTimer():
    payload = dict()
    payload["remaining"] = bout.timers.game._millis_remaining
    payload["started_at"] = bout.timers.game._started
    return payload

@socketio.event
def startGameTimer(timestamp):
    try:
        print("Starting timer")
        bout.timers.game.start(timestamp)
    except:
        print("error")
        pass
    payload = dict()
    payload["remaining"] = bout.timers.game._millis_remaining
    payload["started_at"] = bout.timers.game._started
    socketio.emit("timer", payload)
    
@socketio.event
def stopGameTimer(timestamp):
    try:
        print("stopping timer")
        bout.timers.game.pause(timestamp)
    except:
        pass
    payload = dict()
    payload["remaining"] = bout.timers.game._millis_remaining
    payload["started_at"] = bout.timers.game._started
    socketio.emit("timer", payload)
    

class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        serverThread = Thread(
            target=socketio.run, args=(server, "0.0.0.0", 5000), daemon=True
        )
        serverThread.start()
        self.show()


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
        qApp.exec()
