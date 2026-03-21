"""Base core schemas.

These schemas are the parent class for all schemas in the app.
"""

from typing import ClassVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ServerSchema(BaseModel):
    """The base schema for schemas which originate from this server.

    This is the base schema for all schemas that this server generates. It automatically
    converts all snake_case attributes, the Python standard, to camelCase, the
    Javascript and Typescript standard.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        alias_generator=to_camel,
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
