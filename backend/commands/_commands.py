from abc import ABC, abstractmethod
from typing import override

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase


class Command(ABC):
    @abstractmethod
    async def execute(self, db: AsyncSession) -> None: ...

    @abstractmethod
    async def undo(self, db: AsyncSession) -> None: ...

    async def merge(self, db: AsyncSession) -> None:
        for attr_name, attr_value in self.__dict__.items():
            if isinstance(attr_value, DeclarativeBase):
                setattr(self, attr_name, await db.merge(attr_value))


class AggregateCommand(Command):
    def __init__(self) -> None:
        self._commands: list[Command] = []

    def add(self, command: Command) -> None:
        self._commands.append(command)

    @override
    async def execute(self, db: AsyncSession) -> None:
        for command in self._commands:
            await command.merge(db)
            await command.execute(db)
            await db.flush()
            
    @override
    async def undo(self, db: AsyncSession) -> None:
        for command in reversed(self._commands):
            await command.merge(db)
            await command.undo(db)
