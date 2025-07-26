from __future__ import annotations

from datetime import timedelta
from math import floor
from typing import Any

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    MappedAsDataclass,
    mapped_column,
)
from sqlalchemy.types import Integer, TypeDecorator


class TimedeltaAsMilliseconds(TypeDecorator):
    impl = Integer
    cache_ok = True

    def process_bind_param(self, value: Any, _) -> int:
        assert isinstance(value, timedelta)
        return floor(value.total_seconds() * 1000)

    def process_result_value(self, value: Any, _) -> timedelta:
        assert isinstance(value, (float, int))
        return timedelta(milliseconds=value)


class SQLModel(AsyncAttrs, MappedAsDataclass, DeclarativeBase):
    _id: Mapped[int] = mapped_column(primary_key=True, init=False)
