from PyQt6.QtWidgets import QApplication, QMainWindow
from flask import Flask, render_template
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
import sys
from roller_derby import Bout, Timer

DEBUG_FLASK = True

server = Flask(__name__)
socketio = SocketIO(server)


@server.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


@socketio.event
def sync():
    return Timer.current_time()


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
