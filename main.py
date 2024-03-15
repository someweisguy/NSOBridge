from PyQt6.QtWidgets import QApplication, QWidget
from flask import Flask
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
import sys

app = Flask(__name__)
socketio = SocketIO(app)
gui = QApplication(sys.argv)


@app.route("/")
def index():
    return "Hello world!"


if __name__ == "__main__":
    Thread(target=socketio.run, args=(app,), daemon=True).start()
    window = QWidget()
    window.show()

    gui.exec()
