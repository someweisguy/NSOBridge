"""Base schemas for use in other modules."""

from datetime import timedelta
from typing import ClassVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from .utils import _timedelta_encoder


class ServerSchema(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_alias=True,
    )
