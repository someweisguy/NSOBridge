"""Qt windows for the GUI module."""

import core
from fastapi import FastAPI
from PySide6 import QtCore, QtWidgets
from PySide6.QtCore import Qt, QUrl
from PySide6.QtGui import QDesktopServices, QFont, QPixmap
from PySide6.QtNetwork import QNetworkAccessManager, QNetworkReply, QNetworkRequest
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QSystemTrayIcon,
    QVBoxLayout,
    QWidget,
)
from update import UPDATE_URL


class AppWindow(QMainWindow):
    """The main Qt window for the GUI."""

    def _add_widgets(self, app: FastAPI, icon_pixmap: QPixmap) -> None:
        self.setWindowTitle(app.title)

        page_layout = QVBoxLayout()
        button_layout = QHBoxLayout()

        image_label: QLabel = QLabel(alignment=Qt.AlignmentFlag.AlignCenter)
        image_label.setPixmap(icon_pixmap)

        version_text = QLabel(app.version, alignment=Qt.AlignmentFlag.AlignHCenter)
        version_text.setFixedHeight(15)
        font: QFont = version_text.font()
        font.setPointSize(9)
        version_text.setFont(font)

        font: QFont = self.update_label.font()
        font.setPointSize(10)
        self.update_label.setFont(font)

        font: QFont = self.status_label.font()
        font.setPointSize(16)
        font.setBold(True)
        self.status_label.setFont(font)

        font: QFont = self.host_label.font()
        font.setPointSize(8)
        self.host_label.setFont(font)

        launch_button = QPushButton('Launch NSO Bridge')
        launch_button.clicked.connect(self.launch_web)

        line = QFrame()
        line.setFrameShape(QFrame.Shape.HLine)
        line.setFrameShadow(QFrame.Shadow.Sunken)
        line.setLineWidth(1)

        page_layout.addWidget(image_label)
        page_layout.addWidget(version_text)
        page_layout.addWidget(self.update_label)
        page_layout.addWidget(self.status_label)
        page_layout.addWidget(self.host_label)
        page_layout.addWidget(launch_button)
        page_layout.addWidget(line)
        page_layout.addLayout(button_layout)

        hide_button = QPushButton('Hide')
        hide_button.clicked.connect(self.hide_window)

        options_button = QPushButton('Advanced...')
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

    def _handle_response(self, reply: QNetworkReply) -> None:
        """Handle network responses for the GUI.

        Don't call this method directly.

        Args:
            reply (QNetworkReply): the reply from a network request.

        """
        e: QNetworkReply.NetworkError = reply.error()
        url: QUrl = QUrl(self.host_label.text())

        if reply.request().url() == url:
            # This was a request to see if the server was started yet
            if e == QNetworkReply.NetworkError.NoError:
                self.status_label.setText('Running')
            else:
                request = QNetworkRequest(url)
                self.nam.get(request)
        elif e != QNetworkReply.NetworkError.NoError:
            # This was a request to check for updates, but it failed
            self.update_label.setText('Unable to check for updates right now.')
        else:
            # This request was a successful update check!
            # TODO: get a link to the latest update
            self.update_label.setText('There are no updates at this time.')

    def __init__(self, app: FastAPI, icon_pixmap: QPixmap):
        """Initialize the main window.

        Args:
            app (FastAPI): the app whose information should be displayed.
            icon_pixmap (QPixmap): the pixmap of the image to be the GUI's icon.

        """
        super().__init__()

        host: str = app.extra['host']
        port: int = app.extra['port']
        if host == '0.0.0.0':  # noqa: S104 - users may bind to all interfaces
            http_port: int = 80
            host = core.get_default_route()

        self.status_label: QLabel = QLabel(
            'Loading...',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignBottom,
        )
        self.update_label: QLabel = QLabel(
            'Checking for Updates...',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
        )
        http_port: int = 80
        self.host_label: QLabel = QLabel(
            f'http://{host}{f":{port}" if port != http_port else ""}',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
        )

        self._add_widgets(app, icon_pixmap)

        port: int = app.extra['port']
        self.nam: QNetworkAccessManager = QNetworkAccessManager()
        self.nam.finished.connect(self._handle_response)
        self.nam.get(QNetworkRequest(QUrl(self.host_label.text())))
        self.nam.get(QNetworkRequest(QUrl(UPDATE_URL)))

    @QtCore.Slot()
    def launch_web(self):
        """Open the default web browser to the client page."""
        # TODO: point this to the actual IP address and port of this server
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
