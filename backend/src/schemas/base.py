from datetime import timedelta
from math import floor
from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

type ModelKey = tuple[Literal['bout'], str] | tuple[Literal['jam'], str, int, int]


def _timedelta_encoder(value: timedelta) -> int:
    return floor(value.total_seconds() * 1000)


class ServerModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_name=True,
    )


class ClientModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_alias=True,
    )
