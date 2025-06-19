from datetime import timedelta
from functools import cached_property
from math import floor

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


def _timedelta_encoder(value: timedelta) -> int:
    return floor(value.total_seconds() * 1000)

type ModelKey = list

class ProjectModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_alias=True,
        validate_by_name=True,
    )

class Gettable:
    @cached_property
    def key(self): ...