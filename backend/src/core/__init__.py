"""Core NSO Bridge dependencies.

There are eight sub-modules with this module: `app`, `db`, `server`, `updates`, `users`,
and `ws`.

- `app` includes functionality for running the core FastAPI application and WebSockets.
- `db' pertains to database operations.
- `server` manages the network layer
- `updates` is involved in checking for updates to this application.
- `users` is for user management and related operations.

An additional `logging` file is used to configure information and error logging.
"""

from .logging import configure_logging

__all__ = ('configure_logging',)
