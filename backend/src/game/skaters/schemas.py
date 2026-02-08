"""Pydantic Skater schemas."""

from __future__ import annotations

from core import ServerSchema


class SkaterSchema(ServerSchema):
    """Represent a Skater as a JSON schema."""

    name: str
    num: str
