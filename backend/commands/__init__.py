from .commands import Command

undo_history: list[Command] = []
redo_history: list[Command] = []


def execute(command: Command) -> None:
    command.execute()
    if len(redo_history) > 0:
        redo_history.clear()
    # TODO: manage undo history here
    undo_history.append(command)


def undo() -> None:
    if len(undo_history) == 0:
        raise RuntimeError('There is nothing to undo')
    command: Command = undo_history.pop()
    # TODO: command.undo()
    redo_history.append(command)


def redo() -> None:
    if len(redo_history) == 0:
        raise RuntimeError('There is nothing to redo')
    command: Command = redo_history.pop()
    command.execute()
    undo_history.append(command)


__all__ = ('Command',)
