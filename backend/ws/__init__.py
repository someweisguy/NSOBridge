"""Handle all things related to WebSockets.

Websockets are primarily used in this application for communicating state changes back
to clients. A reasonable comparison can be made between this application and a chatroom.
When one client changes, say, the state of a Bout all clients should be made aware of
this change. This is very similar to a chatroom such that when one client sends a chat
message all clients should be updated that there is a new chat message to read.

There is one other use case for WebSockets in this application: the synchronization of
the server clock to the client clocks. All game time data is stored on the server using
the system time that is stored on the server. Because there may be variations between
clients on what the agreed upon time should be, it is required for all clients to be
able to synchronize their game clocks with a leader. The server is used as the clock
leader.

There are no other requirements of this application that must be met by WebSockets. In
order to keep code complexity to a minimum, this module shall be made only to meet the
minimum project requirements.
"""

from .service import app, broadcast_updates, disconnect_all

__all__ = (
    'app',
    'broadcast_updates',
    'disconnect_all',
)
