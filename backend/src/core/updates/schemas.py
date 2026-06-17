"""Updater schemas."""

from typing import ClassVar

from pydantic.config import ConfigDict

from core import ClientSchema


class GithubReleaseSchema(ClientSchema):
    """A schema matching the Github release API.

    This schema contains information about Github releases.
    """

    model_config: ClassVar[ConfigDict] = ConfigDict(
        extra='allow',
        from_attributes=True,
        validate_by_alias=False,
    )

    name: str
    html_url: str
    tag_name: str
    draft: bool
