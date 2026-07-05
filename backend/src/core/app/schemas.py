"""Core application schemas."""

from __future__ import annotations

from typing import Any, ClassVar

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ModelWrapValidatorHandler,
    model_validator,
)
from pydantic.alias_generators import to_camel

from .service import get_schema
from .types import CacheableProtocol, CacheKey


class ServerSchema(BaseModel):
    """The base schema for schemas which originate from this server.

    This is the base schema for all schemas that this server generates. It automatically
    converts all snake_case attributes, the Python standard, to camelCase, the
    Javascript and Typescript standard.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        arbitrary_types_allowed=True,
        from_attributes=True,
        validate_by_name=True,
        serialize_by_alias=True,
    )


class ClientSchema(BaseModel):
    """The base schema for schemas which originate from outside of this server.

    This is the base schema for all schemas which are generated from outside of this
    server. It automatically converts all camelCase attributes, the Javascript and
    Typescript standard, to snake_case, the Python standard. This schema also forbids
    extra arguments, raising exceptions when additional fields are provided.

    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
        extra='forbid',
        from_attributes=True,
        validate_by_alias=True,
    )


class CacheSchema[T: ServerSchema](ServerSchema):
    """A special schema that renders cache updates.

    This schema is designed to take an object which implements the Cacheable Protocol
    and convert it to a schema with a validated data field as well as a validated cache
    field.

    If the provided data is not cacheable, it is serialized with the default handler.
    """

    class _CacheItemSchema(ServerSchema):
        key: CacheKey
        data: Any  # This type must be Any for Pydantic to work properly

    data: T | None = Field(default=None)
    cache: list[_CacheItemSchema] = Field(
        default_factory=[], exclude_if=lambda c: not len(c)
    )

    @model_validator(mode='wrap')
    @classmethod
    def _generate_schema(
        cls, data: Any, handler: ModelWrapValidatorHandler[Any]
    ) -> Any:
        if not isinstance(data, CacheableProtocol):
            return handler(data)

        return CacheSchema(
            data=get_schema(type(data)).model_validate(data),
            cache=[
                CacheSchema._CacheItemSchema(
                    key=model.cache_key(),
                    data=get_schema(type(model)).model_validate(model),
                )
                for model in data.get_updates()
            ],
        )


class ErrorSchema(ServerSchema):
    """A schema for returning detailed error messages to clients."""

    type: str
    message: str


class VersionSchema(ServerSchema):
    """The schema which returns application version information."""

    version: str
