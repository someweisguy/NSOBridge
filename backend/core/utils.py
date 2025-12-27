"""Utilities for use in the core application.

These should not generally be used outside of the core module.

"""

from __future__ import annotations

from datetime import timedelta
from math import floor
from typing import TYPE_CHECKING, Any, override

from sqlalchemy.types import Integer, TypeDecorator, TypeEngine

if TYPE_CHECKING:
    from sqlalchemy import Dialect


class _TimedeltaAsMilliseconds(TypeDecorator[Integer]):
    """Converts integer number of milliseconds to a Python timedelta object.

    This class is used for converting values to and from the model database.
    """

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
    """Convert a Python timedelta object to an integer number of milliseconds.

    This method is used for serializing timedelta objects to JSON.

    Args:
        value (timedelta): the timedelta to convert.

    Returns:
        int: the number of milliseconds represented by the timedelta object.

    """
    return floor(value.total_seconds() * 1000)
