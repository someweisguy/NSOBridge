"""Types for the user module.

In this file the User class and its associated business logic can be found.

"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
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
