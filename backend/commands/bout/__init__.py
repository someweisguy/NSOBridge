from datetime import datetime
from typing import override

from models import GenericBoutModel
from sqlalchemy.ext.asyncio import AsyncSession

from commands import Command

from . import _jam as Jam, _timeout as Timeout


class SetIsRunning(Command):
    def __init__(self, bout: GenericBoutModel, is_running: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: bool = is_running
        self.old_value: bool = bout.is_running

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot update a Period if the Bout has been finalized')
        elif self.bout.get_state() != 'lineup' and not self.new_value:
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() == 'final':
            raise RuntimeError('Cannot update a Period if the Bout has been finalized')
        elif self.bout.get_state() != 'lineup' and not self.old_value:
            raise RuntimeError('The Period cannot be ended right now')
        self.bout.is_running = self.old_value


class SetPeriodStartTimestamp(Command):
    def __init__(
        self, bout: GenericBoutModel, start_timestamp: datetime | None
    ) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: datetime | None = start_timestamp
        self.old_value: datetime | None = bout.expected_start_timestamp

    @override
    def execute(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        self.bout.expected_start_timestamp = self.old_value


class SetIsFinal(Command):
    def __init__(self, bout: GenericBoutModel, is_final: bool) -> None:
        self.bout: GenericBoutModel = bout
        self.new_value: bool = is_final
        self.old_value: bool = bout.is_final

    @override
    def execute(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.new_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.new_value

    @override
    async def undo(self, db: AsyncSession) -> None:
        if self.bout.get_state() != 'lineup' and self.old_value:
            raise RuntimeError('The Bout cannot be finalized right now')
        self.bout.is_final = self.old_value


# TODO: class SetOrder(Command)


__all__ = 'Jam', 'Timeout'
