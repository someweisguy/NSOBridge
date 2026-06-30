"""Pydantic Skater schemas."""

from core.app import ServerSchema, register_model

from .models import Skater


@register_model(Skater)
class SkaterSchema(ServerSchema):
    """Represent a Skater as a JSON schema."""

    name: str
    num: str
