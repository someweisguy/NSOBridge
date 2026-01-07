"""The application backend GUI runtime."""

from pathlib import Path

from fastapi import FastAPI
from PySide6 import QtCore, QtWidgets
from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QDesktopServices, QFont, QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import QMainWindow, QSystemTrayIcon, QWidget


class AppWindow(QMainWindow):
    """The main Qt window for the GUI."""

    @classmethod
    def get_svg_pixmap(cls, path: Path | str) -> QPixmap:
        """Get a Qt Pixmap of the desired .svg file.

        Args:
            path (Path | str): the pathname to the .svg file.

        Raises:
            ValueError: if the pathname is invalid.

        Returns:
            QPixmap: a Qt Pixmap of of the .svg file.

        """
        renderer = QSvgRenderer(str(path))
        if not renderer.isValid():
            raise ValueError('Invalid GUI icon path')

        # Create the Qt pixmap
        pixmap: QPixmap = QPixmap(QSize(64, 64))
        pixmap.fill(Qt.GlobalColor.transparent)

        # Paint the icon onto the pixmap
        painter: QPainter = QPainter(pixmap)
        renderer.render(painter)
        painter.end()

        return pixmap

    def __init__(self, app: FastAPI, icon_path: Path | str):
        """Initialize the main window.

        Args:
            app (FastAPI): the app whose information should be displayed.
            icon_path (Path | str): the pathname of a .svg file to act as the GUI icon.

        """
        super().__init__()
        self.setWindowTitle(app.title)

        page_layout = QtWidgets.QVBoxLayout()
        button_layout = QtWidgets.QHBoxLayout()

        version_text = QtWidgets.QLabel(
            app.version, alignment=Qt.AlignmentFlag.AlignHCenter
        )
        version_text.setFixedHeight(15)
        font: QFont = version_text.font()
        font.setPointSize(9)
        font.setItalic(True)
        version_text.setFont(font)

        image_label = QtWidgets.QLabel(alignment=Qt.AlignmentFlag.AlignCenter)
        image_label.setPixmap(self.get_svg_pixmap(icon_path))

        self.text = QtWidgets.QLabel(
            'Loading...',
            alignment=Qt.AlignmentFlag.AlignCenter,
        )
        font: QFont = self.text.font()
        font.setPointSize(16)
        self.text.setFont(font)

        launch_button = QtWidgets.QPushButton('Launch NSO Bridge')
        launch_button.clicked.connect(self.launch_web)

        line = QtWidgets.QFrame()
        line.setFrameShape(QtWidgets.QFrame.Shape.HLine)
        line.setFrameShadow(QtWidgets.QFrame.Shadow.Sunken)
        line.setLineWidth(1)

        page_layout.addWidget(image_label)
        page_layout.addWidget(version_text)
        page_layout.addWidget(self.text)
        page_layout.addWidget(launch_button)
        page_layout.addWidget(line)
        page_layout.addLayout(button_layout)

        hide_button = QtWidgets.QPushButton('Hide')
        hide_button.clicked.connect(self.hide_window)

        options_button = QtWidgets.QPushButton('Advanced...')
        options_button.clicked.connect(self.show_options)
        options_button.setDisabled(True)  # TODO: implement advanced features

        button_layout.addWidget(hide_button)
        button_layout.addWidget(options_button)

        widget = QWidget()
        widget.setLayout(page_layout)

        self.setCentralWidget(widget)

        # Hide the minimize and maximize buttons
        self.setWindowFlags(Qt.WindowType.Dialog)
        self.setFixedSize(250, 300)

        # TODO: Conditionally run this if there is no system tray
        self.tray_icon = QtWidgets.QSystemTrayIcon(widget)
        self.tray_icon.setIcon(self.windowIcon())
        self.tray_icon.setVisible(True)

    @QtCore.Slot()
    def launch_web(self):
        """Open the default web browser to the client page."""
        # TODO: point this to the actual IP address of this server
        QDesktopServices.openUrl('http://localhost:8000')

    @QtCore.Slot()
    def show_options(self):
        """Open a window to configure advanced server options."""
        # TODO: implement advanced options
        pass

    @QtCore.Slot()
    def hide_window(self):
        """Minimize the main window to the system tray."""
        # TODO: implement window un-hiding
        self.hide()
        self.tray_icon.showMessage(
            'NSO Bridge is in your system tray!',
            'Click the NSO Bridge icon to open the server window',
            QSystemTrayIcon.MessageIcon.NoIcon,
            2000,
        )


def run_gui(app: FastAPI) -> None:
    """Run the GUI.

    Args:
        app (FastAPI): the FastAPI app to pass to the GUI.

    """
    gui = QtWidgets.QApplication([])
    gui.setApplicationName(app.title)

    icon_path: Path = Path.cwd() / 'frontend/public/skate.svg'
    icon: QPixmap = AppWindow.get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    window = AppWindow(app, icon_path)
    window.show()

    gui.exec()
