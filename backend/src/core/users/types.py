"""Types for the user module.

In this file the User class and its associated business logic can be found.

"""

from __future__ import annotations

from typing import TYPE_CHECKING, Iterable, Protocol

if TYPE_CHECKING:
    from core.app import CacheableProtocol


class Memento(Protocol):
    """Represent a memento point-in-time of the application state.

    Mementos can be used to implement functionality such as undo and redo by restoring
    the application to a previous state.
    """

    async def get_cache_updates(self) -> Iterable[CacheableProtocol]:
        """Get a list of the cache updates that will occur if this Memento is restored.

        Returns:
            Iterable[CacheableProtocol]: the cache updates.

        """
        ...

    async def restore(self) -> Memento:
        """Restore the state of the application to when this Memento was constructed.

        Returns:
            Memento: A Memento of the state of the application before this method was
            called. Calling `restore()` on this newly created Memento has the effect of
            redoing an operation.

        """
        ...


class User:
    """The User class. Store contextual information about a user."""

    __slots__: tuple[str, ...] = '_staged', 'undo_history', 'redo_history'

    def __init__(self) -> None:
        """Initialize a User."""
        self._staged: Memento | None = None
        self.undo_history: list[Memento] = []
        self.redo_history: list[Memento] = []

    def stage(self, memento: Memento) -> None:
        """Stage a Memento before committing it.

        This method is used to stage a memento before committing it to the undo history.
        This is necessary because it is not clear if a Memento should be pushed to the
        undo history until the transaction has completed.

        Args:
            memento (Memento): the Memento to stage.

        """
        self._staged = memento

    def commit(self) -> None:
        """Commit a Memento to the undo history.

        This method should be called when a transaction completes successfully and a
        Memento is ready to be undone with the undo command.
        """
        if self._staged is not None:
            self.undo_history.append(self._staged)
            self.redo_history.clear()
            self._staged = None

    def unstage(self) -> None:
        """Unstage a Memento.

        When a transaction is not completed successfully, this method ensure that the
        Memento is not committed to the undo history.
        """
        self._staged = None

    async def undo(self) -> Iterable[CacheableProtocol]:
        """Undo the last command.

        Pops a Memento from the undo history and push its "redo" Memento to the redo
        history.

        Raises:
            RuntimeError: if there is nothing to undo.

        """
        if len(self.undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        undo_memento: Memento = self.undo_history.pop()
        self.redo_history.append(await undo_memento.restore())
        updates: Iterable[CacheableProtocol] = await undo_memento.get_cache_updates()
        return updates

    async def redo(self) -> Iterable[CacheableProtocol]:
        """Redo the last undone command.

        Pops a Memento from the redo history and push its "re-undo" Memento to the undo
        history.

        Raises:
            RuntimeError: if there is nothing to redo.

        """
        if len(self.redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        redo_memento: Memento = self.redo_history.pop()
        self.undo_history.append(await redo_memento.restore())
        updates: Iterable[CacheableProtocol] = await redo_memento.get_cache_updates()
        return updates
