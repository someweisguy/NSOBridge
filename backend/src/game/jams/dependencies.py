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

from .models import Jam


async def _get_jam(
    user: GetUser,
    uuid: Annotated[UUID, Query()],
) -> Jam:
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


GetJam: TypeAlias = Annotated[Jam, Depends(_get_jam)]
