"""The WebSocket manager.

The WebSocket manager has two functions: invalidating cached data and synchronizing time
with clients. When the application state is changed, a message should be broadcast to
all WebSocket clients that the application state has changed.

Secondly, when the WebSocket manager receives a message from a client, a message must
immediately be returned with the current datetime according to the server. Clients may
then use this timestamp to calculate the time of the server using Cristian's algorithm.

Additional information about this server is included on the return message as a
convenience feature.
"""

from .service import app, disconnect_all, send_all

__all__ = (
    'app',
    'disconnect_all',
    'send_all',
)
