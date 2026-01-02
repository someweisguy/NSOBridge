"""Base schemas for use in other modules."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, ClassVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from pydantic.fields import Field

from .utils import _timedelta_encoder


class ServerSchema(BaseModel):
    """The base schema for schemas which originate from this server.

    This is the base schema for all schemas that this server generates. It automatically
    converts all snake_case attributes, the Python standard, to camelCase, the
    Javascript and Typescript standard.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    """The base schema for schemas which originate from outside of this server.

    This is the base schema for all schemas which are generated from outside of this
    server. It automatically converst all camelCase attributes, the Javascript and
    Typescript standard, to snake_case, the Python standard. This schema also forbids
    extra arguments, raising exceptions when additional fields are provided.

    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        json_encoders={timedelta: _timedelta_encoder},
        validate_by_alias=True,
    )


class APISchema(ServerSchema):
    """The default schema for returning API requests."""

    status_code: int
    error: ErrorSchema | None = Field(default=None, exclude_if=lambda e: e is None)
    data: Any = None
    timestamp: datetime = Field(default_factory=datetime.now, init=False)
    path: str
    method: str


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str
    description: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str
