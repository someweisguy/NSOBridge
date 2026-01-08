"""Service methods for the GUI module."""

from pathlib import Path
from typing import TYPE_CHECKING

from fastapi import FastAPI
from PySide6.QtWidgets import QApplication

from .qt import AppWindow

if TYPE_CHECKING:
    from PySide6.QtGui import QPixmap


def run(app: FastAPI) -> None:
    """Run the GUI.

    Args:
        app (FastAPI): the FastAPI app to pass to the GUI.

    """
    gui = QApplication()
    gui.setApplicationName(app.title)

    # TODO: fix this path
    icon_path: Path = Path.cwd() / 'frontend/public/skate.svg'
    icon: QPixmap = AppWindow.get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    window = AppWindow(app, icon_path)
    window.show()

    gui.exec()
