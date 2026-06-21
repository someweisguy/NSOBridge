"""Pydantic Skater schemas."""

from __future__ import annotations

from core.app import ServerSchema


class SkaterSchema(ServerSchema):
    """Represent a Skater as a JSON schema."""

    name: str
    num: str
