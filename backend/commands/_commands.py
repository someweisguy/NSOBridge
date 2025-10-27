from abc import ABC, abstractmethod
from typing import override

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase


class Command(ABC):
    # TODO: change arg name to 'session'
    @abstractmethod
    async def execute(self, session: AsyncSession) -> None: ...

    # TODO: change arg name to 'session'
    @abstractmethod
    async def undo(self, session: AsyncSession) -> None: ...

    # # TODO: change arg name to 'session'
    # async def merge(self, session: AsyncSession) -> None:
    #     for attr_name, attr_value in self.__dict__.items():
    #         if isinstance(attr_value, DeclarativeBase):
    #             setattr(self, attr_name, await session.merge(attr_value))


class AggregateCommand(Command):
    def __init__(self) -> None:
        self._commands: list[Command] = []

    def add(self, command: Command) -> None:
        self._commands.append(command)

    @override
    async def execute(self, session: AsyncSession) -> None:
        for command in self._commands:
            await command.execute(session)
            
    @override
    async def undo(self, session: AsyncSession) -> None:
        for command in reversed(self._commands):
            await command.undo(session)