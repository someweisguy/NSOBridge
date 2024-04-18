from PySide6.QtCore import QThreadPool, Slot, QFile
from PySide6.QtUiTools import QUiLoader
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QLabel,
    QLineEdit,
    QPushButton,
)
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

        # Validate the server port number
        if 1 > port > 65535:
            raise ValueError("invalid port number")

        # Load the main widget from the UI file
        widget: QWidget = QUiLoader().load(QFile("./NSOBridge.ui"), self)
        if not widget:
            raise OSError("unable to load splash page")
        self.setCentralWidget(widget)
        self.setWindowTitle(widget.windowTitle())
        self.setFixedSize(widget.size())
        self.setFocus()

        # Set the default port number and default port hint text
        portLineEdit: QLineEdit = widget.findChild(QLineEdit, "portLineEdit")
        portLineEdit.setText(str(port))
        defaultPortLabel: QLabel = widget.findChild(QLabel, "defaultPortLabel")
        defaultPortLabel.setText(f"The default port is {port}.")

        # Set the update checker label
        # TODO

        self.show()

        # Start the application server
        self.controller = Controller(port)
        self.controller.signals.running.connect(self.serverRunCallback)
        QThreadPool.globalInstance().start(self.controller)

    def closeEvent(self, event) -> None:
        self.controller.stop()

    @Slot(bool)
    def serverRunCallback(self, running: bool):
        # Set the start/stop button text
        startServerButton: QPushButton = self.findChild(
            QPushButton, "startServerButton"
        )
        actionText: str = "Start" if not running else "Stop"
        startServerButton.setText(f"{actionText} Scoreboard")

        # Set the state label text
        # TODO

        # Set the server link label
        # TODO


if __name__ == "__main__":
    qt = QApplication(sys.argv)
    mainWindow = MainWindow(8000)
    qt.exec()
