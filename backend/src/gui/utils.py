"""GUI-related utility functions."""

from pathlib import Path

from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer


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
