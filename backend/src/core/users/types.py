"""Types for the user module.

In this file the User class and its associated business logic can be found.

"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import Request

    from core.app import Memento


class User:
    """The User class. Store contextual information about a user."""

    __slots__: tuple[str, ...] = '_staged', 'redo_history', 'undo_history'

    def __init__(self) -> None:
        """Initialize a User."""
        self._staged: Memento | None = None
        self.undo_history: list[tuple[str, Memento]] = []
        self.redo_history: list[tuple[str, Memento]] = []

    def stage(self, memento: Memento) -> None:
        """Stage a Memento before committing it.

        This method is used to stage a memento before committing it to the undo history.
        This is necessary because it is not clear if a Memento should be pushed to the
        undo history until the transaction has completed.

        Args:
            memento (Memento): the Memento to stage.

        """
        self._staged = memento

    def staged(self) -> bool:
        """Return True if a Memento has been staged in this user's transaction.

        Returns:
            bool: True if self.stage() has been called during this request.

        """
        return self._staged is not None

    def commit(self, commit_message: str) -> None:
        """Commit a Memento to the undo history.

        This method should be called when a transaction completes successfully and a
        Memento is ready to be undone with the undo command.
        """
        if self._staged is not None:
            self.undo_history.append((commit_message, self._staged))
            self.redo_history.clear()
            self._staged = None

    def unstage(self) -> None:
        """Unstage a Memento.

        When a transaction is not completed successfully, this method ensure that the
        Memento is not committed to the undo history.
        """
        self._staged = None

    async def undo(self, request: Request) -> str:
        """Undo the last command.

        Pops a Memento from the undo history and push its "redo" Memento to the redo
        history.

        Raises:
            RuntimeError: if there is nothing to undo.

        Returns: the undo message of the transaction that was undone.

        """
        if len(self.undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        message, undo_memento = self.undo_history.pop()
        new_memento = await undo_memento.restore(request)
        self.redo_history.append((message, new_memento))
        return message

    async def redo(self, request: Request) -> str:
        """Redo the last undone command.

        Pops a Memento from the redo history and push its "re-undo" Memento to the undo
        history.

        Raises:
            RuntimeError: if there is nothing to redo.

        Returns: the redo message of the transaction that was redone.

        """
        if len(self.redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        message, redo_memento = self.redo_history.pop()
        new_memento = await redo_memento.restore(request)
        self.undo_history.append((message, new_memento))
        return message
