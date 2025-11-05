from __future__ import annotations

from typing import Annotated, Protocol, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class Mementoable(Protocol):
    def get_snapshot(self) -> Memento: ...


class UserContext:
    __slots__: tuple[str, ...] = '_undo_history', '_redo_history'

    def __init__(self) -> None:
        self._undo_history: list[Memento] = []
        self._redo_history: list[Memento] = []

    def push(self, memento: Memento) -> None:
        self._undo_history.append(memento)
        self._redo_history.clear()

    async def undo(self) -> None:
        if len(self._undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        memento: Memento = self._undo_history.pop()
        memento = await memento.restore()
        self._redo_history.append(memento)

    async def redo(self) -> None:
        if len(self._redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        memento: Memento = self._redo_history.pop()
        memento = await memento.restore()
        self._undo_history.append(memento)


_contexts: dict[UUID, UserContext] = {}


def _get_user_context(
    response: Response,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> UserContext:
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))
    context: UserContext | None = _contexts.get(nso_id, None)
    if context is None:
        context = UserContext()
        _contexts[nso_id] = context
    return context


UserDepends: TypeAlias = Annotated[UserContext, Depends(_get_user_context)]


__all__: tuple[str, ...] = ('Memento', 'Mementoable', 'UserContext', 'UserDepends')
