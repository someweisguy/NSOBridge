from datetime import timedelta
from math import floor
from typing import ClassVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


def timedelta_encoder(value: timedelta) -> int:
    return floor(value.total_seconds() * 1000)


class ServerSchema(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: timedelta_encoder},
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        json_encoders={timedelta: timedelta_encoder},
        validate_by_alias=True,
    )
