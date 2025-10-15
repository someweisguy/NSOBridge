from abc import ABC, abstractmethod
from typing import override

from sqlalchemy.ext.asyncio import AsyncSession


class Command(ABC):
    @abstractmethod
    def execute(self, db: AsyncSession) -> None: ...

    @abstractmethod
    async def undo(self, db: AsyncSession) -> None: ...

    async def _merge(self, db: AsyncSession) -> None:
        return

    async def redo(self, db: AsyncSession) -> None:
        await self._merge(db)
        self.execute(db)


class AggregateCommand(Command):
    def __init__(self) -> None:
        self._commands: list[Command] = []

    def add(self, command: Command) -> None:
        self._commands.append(command)

    @override
    def execute(self, db: AsyncSession) -> None:
        for command in self._commands:
            command.execute(db)

    @override
    async def undo(self, db: AsyncSession) -> None:
        for command in reversed[Command](self._commands):
            await command.undo(db)
