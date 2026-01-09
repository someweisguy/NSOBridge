"""Service methods for the GUI module."""

import logging
from pathlib import Path
from signal import SIGTERM
from threading import Thread
from typing import TYPE_CHECKING

import core
from fastapi import FastAPI
from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import QApplication, QSystemTrayIcon

from .qt import AppWindow

if TYPE_CHECKING:
    from uvicorn import Server


def get_svg_pixmap(path: Path | str) -> QPixmap:
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


def run(app: FastAPI, *, auto_hide: bool) -> None:
    """Run the app until the GUI is closed.

    Args:
        app (FastAPI): the FastAPI app to pass to the GUI.
        auto_hide (bool): True to automatically hide the GUI on app startup.

    """
    gui = QApplication()
    gui.setApplicationName(app.title)

    # TODO: fix this path
    icon_path: Path = Path.cwd() / 'frontend/public/skate.svg'
    icon: QPixmap = get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    window = AppWindow(app, icon)
    if not auto_hide:
        window.show()
    else:
        window.tray_icon.showMessage(
            'NSO Bridge has started',
            'Click the tray icon to open the window.',
            QSystemTrayIcon.MessageIcon.NoIcon,
            2000,
        )

    # Configure and start the server on a new thread
    uvicorn: Server = core.get_server(app)
    uvicorn_thread: Thread = Thread(name='uvicorn', target=uvicorn.run)
    uvicorn_thread.start()

    gui.exec()
    logging.info('The GUI has been closed')

    logging.debug('Sending terminate signal to Uvicorn server')
    uvicorn.handle_exit(SIGTERM, None)
    uvicorn_thread.join()
