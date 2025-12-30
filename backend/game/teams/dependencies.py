"""The FastAPI dependencies methods for Teams."""

from typing import TYPE_CHECKING, Annotated, TypeAlias

from core import AsyncSessionDepends
from fastapi import Body, Depends, Query, Request
from sqlalchemy import select
from user import GetUser

from .models import BaseTeam

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def query_team_or_none(
    request: Request,
    user: GetUser,
    session: AsyncSessionDepends,
    team_id: Annotated[int | None, Query(alias='teamId')] = None,
) -> BaseTeam | None:
    if team_id is None:
        return None

    # Query the database for the desired Bout
    statement: Select[tuple[BaseTeam]] = select(BaseTeam).where(BaseTeam.id == team_id)
    results: Result[tuple[BaseTeam]] = await session.execute(statement)
    team: BaseTeam = results.scalar_one()

    return team


async def get_team_or_none(
    session: AsyncSessionDepends,
    team_id: Annotated[int | None, Body(alias='teamId')] = None,
) -> BaseTeam | None:
    if team_id is None:
        return None

    # Query the database for the desired Bout
    statement: Select[tuple[BaseTeam]] = select(BaseTeam).where(BaseTeam.id == team_id)
    results: Result[tuple[BaseTeam]] = await session.execute(statement)
    team: BaseTeam = results.scalar_one()

    return team


OptionalTeamDepends: TypeAlias = Annotated[BaseTeam | None, Depends(query_team_or_none)]
GetTeamOrNoneByID: TypeAlias = Annotated[BaseTeam | None, Depends(get_team_or_none)]
