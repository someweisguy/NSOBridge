from inspect import Traceback
from typing import Annotated, Protocol, TypeAlias
from uuid import UUID

from fastapi import Cookie, Depends


class Command(Protocol):
    async def __aenter__(self) -> None:
        pass

    async def __aexit__(
        self,
        exception_type: type[BaseException] | None,
        exception_value: BaseException | None,
        traceback: Traceback | None,
    ) -> None:
        pass

    async def do(self) -> None: ...

    async def undo(self) -> None: ...


class UserContext:
    __slots__: tuple[str, ...] = 'undo_history', 'redo_history'

    def __init__(self) -> None:
        self.undo_history: list[Command] = []
        self.redo_history: list[Command] = []

    async def do(self, command: Command) -> None:
        async with command:
            await command.do()
        self.undo_history.append(command)
        self.redo_history.clear()

    async def undo(self) -> None:
        if len(self.undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        command: Command = self.undo_history[-1]
        async with command:
            await command.undo()
        self.redo_history.append(self.undo_history.pop())

    async def redo(self) -> None:
        if len(self.redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        command: Command = self.redo_history[-1]
        async with command:
            await command.do()
        self.undo_history.append(self.redo_history.pop())


_contexts: dict[UUID, UserContext] = {}


def _get_user_context(nso_id: Annotated[UUID, Cookie()]) -> UserContext:
    context: UserContext | None = _contexts.get(nso_id, None)
    if context is None:
        context = UserContext()
        _contexts[nso_id] = context
    return context


UserDepends: TypeAlias = Annotated[UserContext, Depends(_get_user_context)]


__all__: tuple[str, ...] = ('Command', 'UserContext', 'UserDepends')
