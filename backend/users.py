from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, Protocol, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response

if TYPE_CHECKING:
    from collections.abc import Generator


class Memento(Protocol):
    async def restore(self) -> Memento: ...


class Mementoable(Protocol):
    def get_snapshot(self) -> Memento: ...


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


_contexts: dict[UUID, UserContext] = {}


def _get_user_context(
    response: Response,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> Generator[UserContext, None, None]:
    # Set a UUID cookie with the browser
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))

    # Fetch the user context from memory
    context: UserContext | None = _contexts.get(nso_id, None)
    if context is None:
        context = UserContext()
        _contexts[nso_id] = context

    context.reset()  # Clear uncommitted mementos
    yield context
    context.commit()


UserContextDepends: TypeAlias = Annotated[UserContext, Depends(_get_user_context)]
