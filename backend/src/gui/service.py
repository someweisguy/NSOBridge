"""Service methods for the GUI module."""

import asyncio
import logging
from pathlib import Path
from signal import SIGTERM
from threading import Thread
from typing import TYPE_CHECKING

import core.app
import core.db
import core.server
from fastapi import FastAPI
from PySide6.QtWidgets import QApplication
from sqlalchemy.ext.asyncio import create_async_engine

from .types import AppWindow
from .utils import get_svg_pixmap

if TYPE_CHECKING:
    from PySide6.QtGui import QPixmap
    from sqlalchemy.engine.url import URL
    from uvicorn import Server


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

    # Render the application icon
    icon_path: Path = core.app.get_resource_path('public') / 'skate.svg'
    icon: QPixmap = get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    # Render the application window
    window = AppWindow(app, host, port, icon)
    if not auto_hide:
        window.show()
    else:
        window.show_help_toast()

    # Load the default database
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
    uvicorn: Server = core.server.get_server(app, host, port)
    uvicorn_thread: Thread = Thread(name='uvicorn', target=uvicorn.run)
    uvicorn_thread.start()

    # Run the GUI
    gui.exec()
    logging.info('The GUI has been closed')

    logging.debug('Sending terminate signal to Uvicorn server')
    uvicorn.handle_exit(SIGTERM, None)
    uvicorn_thread.join()
