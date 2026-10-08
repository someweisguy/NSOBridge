"""The FastAPI dependencies methods for Jams."""

from http import HTTPStatus
from typing import Annotated, TypeAlias
from uuid import UUID

from core.users import GetUser
from fastapi import Depends, HTTPException, Query
from game.bouts.models import BaseBout
from sqlalchemy import Result, Select, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import selectinload

from .models import Jam, TripEvent


async def get_jam(
    user: GetUser,
    uuid: Annotated[UUID, Query()],
) -> Jam:
    """Get the desired Jam by UUID.

    Args:
        user (GetUser): the user who is performing this request.
        uuid (Annotated[UUID, Query): the UUID of the desired Jam.

    Raises:
        HTTPException: if no such Jam exists.

    Returns:
        Jam: the desired Jam.

    """
    statement: Select[Jam] = (
        select(Jam)
        # Use `selectinload` to allow cache updates of Bout models when Jam is mutated
        .options(selectinload(Jam.bout).selectinload(BaseBout.jams))
        .where(Jam.uuid == uuid)
    )
    results: Result[Jam] = await user.session.execute(statement)

    try:
        jam: Jam = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'Could not find Jam') from e

    return jam


GetJam: TypeAlias = Annotated[Jam, Depends(get_jam)]


async def get_trip_event(
    user: GetUser,
    trip_event_uuid: Annotated[UUID, Query(alias='tripEventUuid')],
) -> TripEvent:
    """Get the desired Trip Event."""
    statement: Select[TripEvent] = select(TripEvent).where(
        TripEvent.uuid == trip_event_uuid
    )
    results: Result[TripEvent] = await user.session.execute(statement)

    try:
        trip_event: TripEvent = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(HTTPStatus.NOT_FOUND, 'Could not find TripEvent') from e

    # Load the parent Jam from the database
    await get_jam(user, trip_event.team_jam.jam.uuid)

    return trip_event


GetTripEvent: TypeAlias = Annotated[TripEvent, Depends(get_trip_event)]
