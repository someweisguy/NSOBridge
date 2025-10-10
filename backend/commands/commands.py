from typing import Protocol, override


class Command(Protocol):
    def execute(self) -> None: ...


class AggregateCommand(Command):
    def __init__(self) -> None:
        self._commands: list[Command] = []

    def add(self, command: Command) -> None:
        self._commands.append(command)

    @override
    def execute(self) -> None:
        for command in self._commands:
            command.execute()
