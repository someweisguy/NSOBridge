from dataclasses import dataclass
from typing import Iterable, Protocol

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ProjectModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )


class Rule(Protocol):
    def execute() -> None: ...

    def update_keys() -> Iterable: ...


@dataclass(frozen=True, slots=True)
class Ruleset:
    start_jam: Rule
    stop_jam: Rule
    call_timeout: Rule
    