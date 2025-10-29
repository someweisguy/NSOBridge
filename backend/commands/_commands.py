from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import cached_property
from typing import override

from models import AsyncSession


@dataclass
class Command(ABC):
    @abstractmethod
    async def execute(self, session: AsyncSession) -> None: ...

    @abstractmethod
    async def undo(self, session: AsyncSession) -> None: ...


@dataclass
class MultiCommand(Command):
    @cached_property
    def commands(self) -> tuple[Command, ...]: ...

    @override
    async def execute(self, session: AsyncSession) -> None:
        for command in self.commands:
            await command.execute(session)

    @override
    async def undo(self, session: AsyncSession) -> None:
        for command in reversed(self.commands):
            await command.undo(session)

