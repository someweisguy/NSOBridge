"""The FastAPI dependencies methods for Rosters."""

from http import HTTPStatus
from typing import Annotated, TypeAlias

from core import AsyncSessionDepends, ClientError
from fastapi import Depends, Query
from sqlalchemy import Result, select
from sqlalchemy.exc import NoResultFound

from .models import Roster


async def _get_roster(
    session: AsyncSessionDepends,
    roster_id: Annotated[int, Query(alias='rosterId')],
) -> Roster:
    results: Result[tuple[Roster]] = await session.execute(
        select(Roster).where(Roster.id == roster_id)
    )

    try:
        roster: Roster = results.scalar_one()
    except NoResultFound as e:
        raise ClientError(
            f'Could not find Roster with ID {roster_id}',
            status_code=HTTPStatus.NOT_FOUND,
        ) from e

    # TODO: handle mementos

    return roster


GetRoster: TypeAlias = Annotated[Roster, Depends(_get_roster)]
