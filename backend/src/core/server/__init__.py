"""The server layer which handles the interface between the network and the application.

This submodule handles the network interface. It provides an API for getting and
shutting down a server. This submodule also provides a method for getting the default
network route.
"""

from .service import get_default_route, get_server, shutdown

__all__ = (
    'get_default_route',
    'get_server',
    'shutdown',
)
