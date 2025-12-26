"""Utilities for use in the core application.

These should not generally be used outside of the core module.

"""

from __future__ import annotations

from datetime import timedelta
from math import floor
from typing import (
    TYPE_CHECKING,
    Any,
    override,
)

from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

if TYPE_CHECKING:
    from sqlalchemy import Dialect


class _TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    impl: TypeEngine[Any] | type[TypeEngine[Any]] = Integer
    cache_ok: bool | None = True

    @override
    def process_bind_param(self, value: Any | None, dialect: Dialect) -> Any:
        if value is not None:
            assert isinstance(value, timedelta)
            return floor(value.total_seconds() * 1000)
        return value

    @override
    def process_result_value(self, value: Any | None, dialect: Dialect) -> Any | None:
        assert isinstance(value, (float, int))
        return timedelta(milliseconds=value)


def _timedelta_encoder(value: timedelta) -> int:
    return floor(value.total_seconds() * 1000)
