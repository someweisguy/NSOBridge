"""User schemas."""

from core.app.schemas import ServerSchema


class HistorySchema(ServerSchema):
    """The undo and redo history of a user."""

    undo: list[str]
    redo: list[str]
