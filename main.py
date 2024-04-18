from PySide6.QtCore import QThreadPool, Slot, QFile, Qt
from PySide6.QtUiTools import QUiLoader
from PySide6.QtWidgets import QApplication, QMainWindow
from flask import render_template
from controller import Controller
import sys


# @socket.event
# def getTimer(_):
#     return bout.timers.game.serialize()


# @socket.event
# def startGameTimer(_, timestamp):
#     try:
#         print("Starting timer")
#         bout.timers.game.start(timestamp)
#         socket.emit("timer", bout.timers.game.serialize())
#     except:
#         pass


# @socket.event
# def stopGameTimer(_, timestamp):
#     try:
#         print("Stopping timer")
#         bout.timers.game.pause(timestamp)
#         socket.emit("timer", bout.timers.game.serialize())
#     except:
#         pass


@Controller.flask.route("/")
def index():
    context = {"sync_iterations": 10}
    return render_template("index.html", **context)


class MainWindow(QMainWindow):
    def __init__(self, port: int) -> None:
        super().__init__()

        # Load the main widget from the UI file
        widget = QUiLoader().load(QFile("./NSOBridge.ui"), None)
        if not widget:
            raise OSError("unable to load Qt widget")
        self.setWindowTitle(widget.windowTitle())
        self.setCentralWidget(widget)
        self.setFixedSize(widget.size())
        self.setWindowFlags(Qt.WindowType.Dialog)
        self.show()

        # Start the application server
        self.controller = Controller(port)
        self.controller.signals.running.connect(self.serverRunCallback)
        QThreadPool.globalInstance().start(self.controller)

    def closeEvent(self, event) -> None:
        self.controller.stop()

    @Slot(bool)
    def serverRunCallback(self, state: bool):
        print(f"WSGI server is{" " if state else " not "}running")


if __name__ == "__main__":
    qt = QApplication(sys.argv)
    mainWindow = MainWindow(8000)
    qt.exec()
