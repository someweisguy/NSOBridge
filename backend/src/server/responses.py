from uuid import UUID

type JSONable = (
    int
    | float
    | str
    | bool
    | None
    | UUID
    | tuple[JSONable, ...]
    | list[JSONable]
    | dict[str, JSONable]
)
