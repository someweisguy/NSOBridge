from PyQt6.QtWidgets import QApplication, QWidget
from flask import Flask
import flask
from flask_socketio import SocketIO
from engineio.async_drivers import gevent  # noqa: F401 - Required for pyinstaller bundle
from threading import Thread
import sys
import time

DEBUG = True

app = Flask(__name__)
socketio = SocketIO(app)
gui = QApplication(sys.argv)


@app.route("/")
def index():
    return flask.render_template("index.html")


@socketio.on("sync")
def client_sync(*_):
    epoch = round(time.time_ns() / 1_000_000)
    print(epoch)
    return epoch


if __name__ == "__main__":
    if DEBUG:
        # Debug the Flask application without the Qt GUI
        socketio.run(app, "0.0.0.0", 5000, debug=True)
    else:
        # Run the Flask application and Qt GUI on separate threads
        Thread(target=socketio.run, args=(app, "0.0.0.0", 5000), daemon=True).start()
        window = QWidget()
        window.show()
        gui.exec()
