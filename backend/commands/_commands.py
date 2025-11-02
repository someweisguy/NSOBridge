from dataclasses import dataclass
from functools import cached_property
from typing import override

from core import Command


@dataclass
class MultiCommand(Command):
    @cached_property
    def commands(self) -> tuple[Command, ...]: ...

    @override
    async def do(self) -> None:
        for command in self.commands:
            async with command:
                await command.do()

    @override
    async def undo(self) -> None:
        for command in reversed[Command](self.commands):
            async with command:
                await command.undo()
