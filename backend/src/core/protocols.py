"""Core Protocols and abstract-base classes for uses in other modules."""

from __future__ import annotations

from typing import Protocol


class Memento(Protocol):
    """Represent a memento point-in-time of the application state.

    Mementos can be used to implement functionality such as undo and redo by restoring
    the application to a previous state.
    """

    async def restore(self) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...
