from PySide6.QtCore import QThreadPool
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
    # TODO: server port number, link to index page

    def __init__(self, port: int = 8000) -> None:
        super().__init__()
        self.show()
        controller = Controller(port)
        QThreadPool.globalInstance().start(controller)

if __name__ == "__main__":
    # Run the Flask application and Qt GUI on separate threads
    qt = QApplication(sys.argv)
    mainWindow = MainWindow(8000)
    qt.exec()
