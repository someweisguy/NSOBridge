"""Qt windows for the GUI module."""

import json
from typing import Iterable, override

import core
import update
from fastapi import FastAPI
from pydantic import ValidationError
from PySide6 import QtCore, QtWidgets
from PySide6.QtCore import QByteArray, QCoreApplication, Qt, QUrl
from PySide6.QtGui import QAction, QCloseEvent, QDesktopServices, QFont, QPixmap
from PySide6.QtNetwork import QNetworkAccessManager, QNetworkReply, QNetworkRequest
from PySide6.QtWidgets import (
    QApplication,
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMenu,
    QMessageBox,
    QPushButton,
    QSystemTrayIcon,
    QVBoxLayout,
    QWidget,
)
from semver import VersionInfo
from update import UPDATE_URL, GithubReleaseSchema


class AppWindow(QMainWindow):
    """The main Qt window for the GUI."""

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

        self.version_label: QLabel = QLabel(
            f'v{app.version}', alignment=Qt.AlignmentFlag.AlignHCenter
        )
        self.update_label: QLabel = QLabel(
            'Checking for updates...',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
        )
        self.update_label.setWordWrap(True)
        self.status_label: QLabel = QLabel(
            'Loading...',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignBottom,
        )
        http_port: int = 80
        self.host_label: QLabel = QLabel(
            f'http://{host}{f":{port}" if port != http_port else ""}',
            alignment=Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
        )
        self.host_label.setTextInteractionFlags(
            Qt.TextInteractionFlag.TextSelectableByMouse
        )
        self.host_label.adjustSize()
        self.add_widgets(icon_pixmap)
        self.setWindowTitle(app.title)

        # Setup the network manager
        self.nam: QNetworkAccessManager = QNetworkAccessManager()
        self.nam.finished.connect(self.handle_response)

        # Configure the system tray
        self.tray_icon = QtWidgets.QSystemTrayIcon(self.centralWidget())
        self.has_shown_help_toast: bool = False
        self.tray_icon.setIcon(self.windowIcon())
        self.tray_icon.setVisible(True)
        self.create_tray_icon()

        # Check if the server is running yet and check for updates
        self.nam.head(QNetworkRequest(QUrl(self.host_label.text())))
        self.nam.get(QNetworkRequest(QUrl(UPDATE_URL)))

    @override
    def closeEvent(self, event: QCloseEvent | bool) -> None:
        confirm: QMessageBox.StandardButton = QMessageBox.question(
            self,
            '',
            'Are you sure you want to quit?',
            defaultButton=QMessageBox.StandardButton.No,
        )

        # Handle situation where this event is called from system tray
        if isinstance(event, bool):
            if confirm != QMessageBox.StandardButton.No:
                gui: QCoreApplication | None = QApplication.instance()
                if gui is None:
                    raise ValueError('GUI is not available')
                gui.quit()
            return

        if confirm == QMessageBox.StandardButton.No:
            event.ignore()
            return
        event.accept()

    @QtCore.Slot()
    def launch_web(self) -> None:
        """Open the default web browser to the client page."""
        QDesktopServices.openUrl(self.host_label.text())

    @QtCore.Slot()
    def show_advanced(self) -> None:
        """Open a window to configure advanced server options."""
        pass  # TODO: implement advanced options

    @QtCore.Slot()
    def hide_window(self) -> None:
        """Minimize the main window to the system tray."""
        self.hide()
        self.show_help_toast()

    def handle_response(self, reply: QNetworkReply) -> None:
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
            self.update_label.setText('Connect to the internet to check for updates.')
        else:
            # This request was a successful update check!
            message: QByteArray = reply.readAll()
            data: Iterable = json.loads(bytes(message.data()).decode('utf-8'))

            # Preset this value in case this method fails
            self.update_label.setText('You are running the latest version!')

            try:
                release: GithubReleaseSchema = update.parse_latest_release(data)
            except (ValidationError, ValueError):
                return

            # Get and compare the against the latest version
            latest_version: VersionInfo = VersionInfo.parse(release.tag_name)
            current_version: VersionInfo = VersionInfo.parse(
                self.version_label.text()[1:]
            )
            if current_version >= latest_version:
                return

            self.update_label.setTextFormat(Qt.TextFormat.MarkdownText)
            self.update_label.setText(
                f'[_Click here_]({release.html_url}) to get the latest version!'
            )
            self.update_label.setOpenExternalLinks(True)

    def create_tray_icon(self) -> None:
        """Create the system tray GUI element.

        Raises:
            ValueError: if there is no GUI application instance running.

        """
        self.tray_icon.setToolTip(self.windowTitle())

        # Create the context menu for the tray icon
        self.tray_menu = QMenu()

        # Add Restore action
        restore_action = QAction('Restore', self)
        restore_action.triggered.connect(self.show_window)
        self.tray_menu.addAction(restore_action)

        # Add Quit action
        quit_action = QAction('Quit', self)
        quit_action.triggered.connect(self.closeEvent)
        self.tray_menu.addAction(quit_action)

        self.tray_icon.setContextMenu(self.tray_menu)
        self.tray_icon.activated.connect(self.on_tray_activated)
        self.tray_icon.messageClicked.connect(self.launch_web)
        self.tray_icon.show()

    @QtCore.Slot()
    def on_tray_activated(self, reason: Qt.ConnectionType) -> None:
        """Open the app when interacting with the system tray.

        This method shouldn't be called directly.

        Args:
            reason (Qt.ConnectionType): the reason this event is firing.

        """
        if reason == QSystemTrayIcon.ActivationReason.DoubleClick:
            self.show_window()

    @QtCore.Slot()
    def show_window(self) -> None:
        """Show the window after it has been hidden."""
        self.show()
        self.activateWindow()
        self.raise_()

    def add_widgets(self, icon_pixmap: QPixmap) -> None:
        """Add the widgets to the window.

        Args:
            icon_pixmap (QPixmap): the pixmap of the app icon.

        """
        page_layout = QVBoxLayout()
        button_layout = QHBoxLayout()

        image_label: QLabel = QLabel(alignment=Qt.AlignmentFlag.AlignCenter)
        image_label.setPixmap(icon_pixmap)

        self.version_label.setFixedHeight(15)
        font: QFont = self.version_label.font()
        font.setPointSize(9)
        self.version_label.setFont(font)

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
        page_layout.addWidget(self.version_label)
        page_layout.addWidget(self.update_label)
        page_layout.addWidget(self.status_label)
        page_layout.addWidget(self.host_label)
        page_layout.addWidget(launch_button)
        page_layout.addWidget(line)
        page_layout.addLayout(button_layout)

        hide_button = QPushButton('Hide')
        hide_button.clicked.connect(self.hide_window)

        options_button = QPushButton('Advanced...')
        options_button.clicked.connect(self.show_advanced)
        options_button.setDisabled(True)  # TODO: implement advanced features

        button_layout.addWidget(hide_button)
        button_layout.addWidget(options_button)

        widget = QWidget()
        widget.setLayout(page_layout)

        self.setCentralWidget(widget)

        # Hide the minimize and maximize buttons
        self.setWindowFlags(Qt.WindowType.Dialog)
        self.setFixedSize(250, 300)

    def show_help_toast(self) -> None:
        """Display the help toast if it hasn't already been shown."""
        if not self.has_shown_help_toast:
            self.has_shown_help_toast = True
            self.tray_icon.showMessage(
                'NSO Bridge is running in your system tray',
                'Click here to open the main page!',
                QSystemTrayIcon.MessageIcon.NoIcon,
                2000,
            )
