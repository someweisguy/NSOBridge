"""Service methods for the GUI module."""

import asyncio
import logging
from pathlib import Path
from signal import SIGTERM
from threading import Thread
from typing import TYPE_CHECKING

import core
import core.db
from fastapi import FastAPI
from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import QApplication
from sqlalchemy.ext.asyncio import create_async_engine

from .qt import AppWindow

if TYPE_CHECKING:
    from sqlalchemy.engine.url import URL
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


def run(
    app: FastAPI,
    db_pathname: str | Path,
    host: str = '0.0.0.0',
    port: int = 8000,
    auto_hide: bool = False,
) -> None:
    """Run the app until the GUI is closed.

    Args:
        app (FastAPI): the FastAPI app to pass to the GUI.
        db_pathname (str): the initial database to which to connect.
        host (str): The interface on which to host the server. Defaults to '0.0.0.0'.
        port (int): The port on which to host the server. Defaults to 8000.
        auto_hide (bool): True to automatically hide the GUI on app startup.

    """
    gui = QApplication()
    gui.setApplicationName(app.title)

    icon_path: Path = core.get_resource_path('public') / 'skate.svg'
    icon: QPixmap = get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    window = AppWindow(app, host, port, icon)
    if not auto_hide:
        window.show()
    else:
        window.show_help_toast()

    try:
        url: URL = core.db.get_database_url(db_pathname)
        async_engine = create_async_engine(url)
        asyncio.run(core.db.create_tables(async_engine))
        core.db.session_factory.configure(bind=async_engine)
    except ValueError as e:
        logging.critical('Database pathname is invalid')
        raise e
    except Exception as e:
        logging.critical(e)
        raise e

    # Configure and start the server on a new thread
    uvicorn: Server = core.get_server(app, host, port)
    uvicorn_thread: Thread = Thread(name='uvicorn', target=uvicorn.run)
    uvicorn_thread.start()

    gui.exec()
    logging.info('The GUI has been closed')

    logging.debug('Sending terminate signal to Uvicorn server')
    uvicorn.handle_exit(SIGTERM, None)
    uvicorn_thread.join()
