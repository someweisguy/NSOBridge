from datetime import timedelta
from math import floor
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field
from pydantic.alias_generators import to_camel

type ModelKey = tuple[Literal['bout'], str] | tuple[Literal['jam'], str, int, int]


def _timedelta_encoder(value: timedelta) -> int:
    return floor(value.total_seconds() * 1000)


class ServerSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_name=True,
        serialize_by_alias=True,
    )


class CacheableSchema(ServerSchema):
    id: int = Field(exclude=True, validation_alias='_id')
    table: str = Field(exclude=True, validation_alias='__tablename__')

    @computed_field
    @property
    def key(self) -> tuple[str, int]:
        return (self.table, self.id)


class ClientSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_alias=True,
    )
