from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core.database import Memento


class UserContext:
    __slots__: tuple[str, ...] = '_undo_history', '_redo_history', '_staged'

    def __init__(self) -> None:
        self._undo_history: list[Memento] = []
        self._redo_history: list[Memento] = []
        self._staged: Memento | None = None

    def stage(self, memento: Memento) -> None:
        self._staged = memento

    def commit(self) -> None:
        if self._staged is not None:
            self._undo_history.append(self._staged)
            self._redo_history.clear()
            self._staged = None

    def reset(self) -> None:
        self._staged = None

    async def undo(self) -> None:
        if len(self._undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        redo_memento: Memento = await self._undo_history.pop().restore()
        self._redo_history.append(redo_memento)

    async def redo(self) -> None:
        if len(self._redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        undo_memento: Memento = await self._redo_history.pop().restore()
        self._undo_history.append(undo_memento)
