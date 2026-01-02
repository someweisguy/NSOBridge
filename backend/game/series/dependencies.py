"""The FastAPI dependencies methods for Series."""

from typing import TYPE_CHECKING, Sequence

from core import AsyncSessionDepends
from sqlalchemy import select

from .models import Series

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


async def _get_all_series(session: AsyncSessionDepends) -> Sequence[Series]:
    statement: Select[tuple[Series]] = select(Series)
    results: Result[tuple[Series]] = await session.execute(statement)

    # TODO: figure out how to handle series dependencies

    return results.scalars().all()
