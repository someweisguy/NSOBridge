from typing import TYPE_CHECKING, Annotated
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response
from models import DatabaseDepends

from .commands import Command

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class CommandHistory:
    def __init__(self, max_history_len: int = 50) -> None:
        self.max_history_len: int = max_history_len
        self.undo_history: list[Command] = []
        self.redo_history: list[Command] = []
        self.session: AsyncSession

    def execute(self, command: Command) -> None:
        command.execute(self.session)
        if len(self.redo_history) > 0:
            self.redo_history.clear()
        self.undo_history.append(command)

        # Manage undo history
        if len(self.undo_history) > self.max_history_len:
            self.undo_history = self.undo_history[-self.max_history_len :]

    async def undo(self) -> None:
        if len(self.undo_history) == 0:
            raise RuntimeError('There is nothing to undo')
        command: Command = self.undo_history.pop()
        await command.undo(self.session)
        self.redo_history.append(command)

    async def redo(self) -> None:
        if len(self.redo_history) == 0:
            raise RuntimeError('There is nothing to redo')
        command: Command = self.redo_history.pop()
        await command.redo(self.session)
        self.undo_history.append(command)


_histories: dict[UUID, CommandHistory] = {}


async def get_command_history(
    db: DatabaseDepends,
    response: Response,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> CommandHistory:
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))
    history: CommandHistory | None = _histories.get(nso_id, None)
    if history is None:
        history = CommandHistory()
        _histories[nso_id] = history
    history.session = db
    return history


HistoryDepends = Annotated[CommandHistory, Depends(get_command_history)]


__all__ = ('Command', 'CommandHistory', 'HistoryDepends')
