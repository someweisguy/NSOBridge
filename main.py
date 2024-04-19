from PySide6.QtCore import QThreadPool, Slot, QFile, Qt, QEvent
from PySide6.QtUiTools import QUiLoader
from PySide6.QtGui import QCloseEvent, QIcon
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QLabel,
    QSpinBox,
    QPushButton,
    QCheckBox,
    QMessageBox,
    QSystemTrayIcon,
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

        # Set the header label
        versionStr: str = "v0.1.0"
        headerLabel: QLabel = self.findChild(QLabel, "headerLabel")
        headerLabel.setText(f"NSO Bridge {versionStr}")

        # Set the default port number and default port hint text
        portSpinBox: QSpinBox = self.findChild(QSpinBox, "portSpinBox")
        portSpinBox.setValue(defaultPort)
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

        # Create and hide the system tray icon
        icon: QIcon = QIcon("./icon.jpg")
        self.tray: QSystemTrayIcon = QSystemTrayIcon(icon, self)
        self.tray.activated.connect(self.trayClicked)
        # TODO: self.tray.setContextMenu()
        self.tray.hide()
        
        # Check for app updates on the GitHub repository
        # TODO

        # Start the application server
        self.controller: Controller = Controller(defaultPort)
        self.controller.signals.running.connect(self.serverRunCallback)
        self.startStopServer()

    def closeEvent(self, event: QCloseEvent) -> None:
        if self.running:
            warningBox: QMessageBox = QMessageBox(self)
            warningBox.setWindowTitle("Exit NSO Bridge?")
            warningBox.setText(
                "Are you sure you want to exit NSO Bridge? Any unsaved changes will be lost."
            )
            warningBox.setStandardButtons(
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.Cancel
            )
            warningBox.setIcon(QMessageBox.Icon.Warning)
            result: int = warningBox.exec()
            if result == QMessageBox.StandardButton.Cancel:
                event.ignore()
                return
        self.startStopServer()

    def changeEvent(self, event: QEvent) -> None:
        if event.type() == QEvent.WindowStateChange and self.isMinimized():
            hideCheckBox: QCheckBox = self.findChild(QCheckBox, "hideCheckBox")
            if hideCheckBox.checkState() == Qt.CheckState.Checked:
                self.showMinimized()
                self.hide()
                self.tray.show()

    @Slot()
    def portChanged(self) -> None:
        print("changed")  # TODO

    @Slot()
    def trayClicked(self) -> None:
        self.tray.hide()
        self.show()
        self.showNormal()

    @Slot()
    def serverErrorCallback(self) -> None:
        self.running = False
        self.serverRunCallback(False)

        # Display an error dialog
        infoBox: QMessageBox = QMessageBox(self)
        infoBox.setWindowTitle("Unable to start NSO Bridge!")
        infoBox.setText(
            "Unable to start NSO Bridge. This may be because the desired port number is in use. Select a different port number and try again."
        )
        infoBox.setStandardButtons(QMessageBox.StandardButton.Ok)
        infoBox.setIcon(QMessageBox.Icon.Information)
        infoBox.exec()

    @Slot(bool)
    def serverRunCallback(self, running: bool) -> None:
        self.running = running

        # Disable setting the port when the server is running
        portSpinBox: QSpinBox = self.findChild(QSpinBox, "portSpinBox")
        portSpinBox.setEnabled(not running)

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
            serverAddress: str = socket.gethostbyname(socket.gethostname())
            httpStr: str = f"http://{serverAddress}:{self.controller.port}"
            serverLinkLabel.setText(f"<a href='{httpStr}'>{httpStr}</a>")
            serverLinkLabel.show()

    @Slot()
    def startStopServer(self) -> None:
        if not self.running:
            portSpinBox: QSpinBox = self.findChild(QSpinBox, "portSpinBox")
            self.controller.port = portSpinBox.value()
            QThreadPool.globalInstance().start(self.controller)
        else:
            try:
                self.controller.stop()
            except Exception:
                pass  # Suppress error when repeated stopping controller


if __name__ == "__main__":
    qt: QApplication = QApplication(sys.argv)
    mainWindow: MainWindow = MainWindow(defaultPort=8000, hideWhenMinimized=True)
    mainWindow.show()
    qt.exec()
