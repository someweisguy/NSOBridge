"""Database schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from core.app import ServerSchema


class CacheResponseSchema(ServerSchema):
    """The cache response schema which is served to clients."""

    transaction_uuid: UUID
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.now, init=False)
    data: Any
    cache: list = Field(default_factory=list, exclude_if=lambda obj: len(obj) == 0)
