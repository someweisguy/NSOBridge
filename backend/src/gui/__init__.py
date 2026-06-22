"""The GUI module for the backend.

Creates a desktop window for the application so users have a polished experience running
the server. GUI management is handled by PySide6 which is backed by Qt.

The GUI contains information about the application as well as buttons which allow the
user launch the application in their browser or hide the GUI by minimizing it to the
system tray.

Users should be able to set the desired interface and port number on which the
application is served from the GUI.
"""

from .service import run

__all__ = ('run',)
