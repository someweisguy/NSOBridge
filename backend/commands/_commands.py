from abc import ABC, abstractmethod
from functools import cached_property
from typing import TYPE_CHECKING, override

from models import AsyncSessionDepends

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class Command(ABC):
    def __init__(self, session: AsyncSessionDepends) -> None:
        self.session: AsyncSession = session

    @abstractmethod
    async def execute(self) -> None: ...

    @abstractmethod
    async def undo(self) -> None: ...


class MultiCommand(Command):
    @cached_property
    def commands(self) -> tuple[Command, ...]: ...

    @override
    async def execute(self) -> None:
        for command in self.commands:
            command.session = self.session
            await command.execute()

    @override
    async def undo(self) -> None:
        for command in reversed(self.commands):
            command.session = self.session
            await command.undo()
