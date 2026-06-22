"""The GUI module for the backend.

Creates a desktop window for the application so users have a polished experience running
the server. GUI management is handled by PySide6 which is backed by Qt.
"""

from .service import run

__all__ = ('run',)
