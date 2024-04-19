from PySide6.QtCore import QThreadPool, Slot, QFile, Qt
from PySide6.QtUiTools import QUiLoader
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QLabel,
    QLineEdit,
    QPushButton,
    QCheckBox
)
from flask import render_template
from controller import Controller
import socket
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
    def __init__(self, *, defaultPort: int, hideWhenMinimized: bool) -> None:
        super().__init__()
        self.running: bool = False

        # Validate the server port number
        if 1 > defaultPort > 65535:
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
        portLineEdit: QLineEdit = self.findChild(QLineEdit, "portLineEdit")
        portLineEdit.setText(str(defaultPort))
        defaultPortLabel: QLabel = self.findChild(QLabel, "defaultPortLabel")
        defaultPortLabel.setText(f"The default port is {defaultPort}.")
        
        # Set the "hide when minimized" checkbox
        hideCheckBox: QCheckBox = self.findChild(QCheckBox, "hideCheckBox")
        hideCheckBox.setCheckState(
            Qt.CheckState.Checked if hideWhenMinimized else Qt.CheckState.Unchecked
        )
        
        # Add the button callback function
        startServerButton: QPushButton = self.findChild(
            QPushButton, "startServerButton"
        )
        startServerButton.clicked.connect(self.startStopServer)

        # Hide the update checker label
        updatesLabel: QLabel = self.findChild(QLabel, "updatesLabel")
        updatesLabel.hide()
        
        # Hide the scoreboard link label
        serverLinkLabel: QLabel = self.findChild(QLabel, "serverLinkLabel")
        serverLinkLabel.hide()

        # Start the application server
        self.controller: Controller = Controller(defaultPort)
        self.controller.signals.running.connect(self.serverRunCallback)
        self.startStopServer()

    def closeEvent(self, event) -> None:
        self.controller.stop()

    @Slot()
    def serverErrorCallback(self) -> None:
        self.running = False
        self.serverRunCallback(False)

        # Display an error dialog
        # TODO

    @Slot(bool)
    def serverRunCallback(self, running: bool):
        self.running = running
        
        # Disable setting the port when the server is running
        portLineEdit: QLineEdit = self.findChild(QLineEdit, "portLineEdit")
        portLineEdit.setEnabled(not running)
        
        # Set the start/stop button text
        startServerButton: QPushButton = self.findChild(
            QPushButton, "startServerButton"
        )
        actionText: str = "Start" if not running else "Stop"
        startServerButton.setText(f"{actionText} Scoreboard")

        # Set the state label text
        stateLabel: QLabel = self.findChild(QLabel, "stateLabel")
        stateLabelText: str = (
            "The scoreboard is not running. Click the Start Scoreboard button above."
            if not running
            else "The scoreboard is running! Click the link below to get started."
        )
        stateLabel.setText(stateLabelText)

        # Set the server link label
        serverLinkLabel: QLabel = self.findChild(QLabel, "serverLinkLabel")
        if not running:
            serverLinkLabel.setText("")
        else:
            serverAddress = socket.gethostbyname(socket.gethostname())
            httpStr: str = f"http://{serverAddress}:{self.controller.port}"
            serverLinkLabel.setText(f"<a href='{httpStr}'>{httpStr}</a>")
            serverLinkLabel.show()
    
    @Slot()   
    def startStopServer(self) -> None:
        if not self.running:
            portLineEdit: QLineEdit = self.findChild(QLineEdit, "portLineEdit")
            port: int = int(portLineEdit.text())
            try:
                self.controller.port = port
                QThreadPool.globalInstance().start(self.controller)
            except ValueError:
                # Display an error dialog
                return  # TODO: dialog box
        else:
            self.controller.stop()
            


if __name__ == "__main__":
    qt = QApplication(sys.argv)
    mainWindow = MainWindow(defaultPort=8000, hideWhenMinimized=True)
    mainWindow.show()
    qt.exec()
