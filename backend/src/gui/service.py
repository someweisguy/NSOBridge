"""Service methods for the GUI module."""

from pathlib import Path

from fastapi import FastAPI
from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import QApplication

from .qt import AppWindow


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


def run(app: FastAPI) -> None:
    """Run the GUI.

    Args:
        app (FastAPI): the FastAPI app to pass to the GUI.

    """
    gui = QApplication()
    gui.setApplicationName(app.title)

    # TODO: fix this path
    icon_path: Path = Path.cwd() / 'frontend/public/skate.svg'
    icon: QPixmap = get_svg_pixmap(icon_path)
    gui.setWindowIcon(icon)

    window = AppWindow(app, icon)
    window.show()

    gui.exec()
