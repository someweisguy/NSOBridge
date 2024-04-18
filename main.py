from PySide6.QtCore import QThreadPool, Slot, QFile
from PySide6.QtUiTools import QUiLoader
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QTextEdit,
    QLabel,
    QPushButton,
    QWidget,
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
    # TODO: server port number, link to index page

    def __init__(self, port: int) -> None:
        super().__init__()

        main = QWidget()
        self.setCentralWidget(main)

        vBox = QVBoxLayout(main)
        main.setLayout(vBox)

        button = QPushButton("button", main)
        port_widget = QTextEdit("text edit", main)
        label = QLabel("hello world", main)

        for widget in (label, port_widget, button):
            vBox.addWidget(widget, stretch=0)

        self.controller = Controller(port)
        self.controller.signals.running.connect(self.serverRunCallback)
        QThreadPool.globalInstance().start(self.controller)
        self.show()

    def closeEvent(self, event) -> None:
        self.controller.stop()

    @Slot(bool)
    def serverRunCallback(self, state: bool):
        print(f"WSGI server is{" " if state else " not "}running")


if __name__ == "__main__":
    qt = QApplication(sys.argv)
    w = QUiLoader().load(QFile("./NSOBridge.ui"), None)
    w.show()
    # mainWindow = MainWindow(8000)
    qt.exec()
