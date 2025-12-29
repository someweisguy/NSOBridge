"""Service requirements for the user module.

In this file the User class and its associated business logic can be found.

"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core import Memento


class User:
    """The User class. Store contextual information about a user."""

    __slots__: tuple[str, ...] = '_undo_history', '_redo_history', '_staged'

    def __init__(self) -> None:
        """Initialize a User."""
        self._undo_history: list[Memento] = []
        self._redo_history: list[Memento] = []
        self._staged: Memento | None = None

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
            self._undo_history.append(self._staged)
            self._redo_history.clear()
            self._staged = None

    def reset(self) -> None:
        """Unstage a Memento.

        When a transaction is not completed successfully, this method ensure that the
        Memento is not committed to the undo history.
        """
        self._staged = None

    async def undo(self) -> None:
        """Undo the last command.

        Pops a Memento from the undo history and push its "redo" Memento to the redo
        history.

        Raises:
            RuntimeError: if there is nothing to undo.

        """
        if len(self._undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        redo_memento: Memento = await self._undo_history.pop().restore()
        self._redo_history.append(redo_memento)

    async def redo(self) -> None:
        """Redo the last undone command.

        Pops a Memento from the redo history and push its "re-undo" Memento to the undo
        history.

        Raises:
            RuntimeError: if there is nothing to redo.

        """
        if len(self._redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        undo_memento: Memento = await self._redo_history.pop().restore()
        self._undo_history.append(undo_memento)
