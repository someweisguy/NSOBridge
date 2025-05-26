from dataclasses import asdict, dataclass
from uuid import UUID

from pydantic.alias_generators import to_camel

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


def camel_dict(data: dataclass) -> dict[str, JSONable]:
    return asdict(data, dict_factory=lambda items: {
        to_camel(k): v for k, v in items
    })