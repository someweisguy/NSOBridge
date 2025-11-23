from typing import TYPE_CHECKING, Annotated, TypeAlias

from database import AsyncSessionDepends
from fastapi import Depends, Query, Request
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseTeamJam

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def get_team_jam(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    team_jam_id: Annotated[int, Query(alias='id')],
) -> BaseTeamJam:
    statement: Select[tuple[BaseTeamJam]] = (
        select(BaseTeamJam).where(BaseTeamJam.id == team_jam_id).limit(1)
    )
    results: Result[tuple[BaseTeamJam]] = await session.execute(statement)
    team_jam: BaseTeamJam = results.scalar_one()

    # Eagerly query the opposing Team Jams to simplify rules logic
    await team_jam.jam.awaitable_attrs.team_jams

    if request.method != 'GET':
        user.stage(team_jam.jam.get_snapshot())
    return team_jam


TeamJamDepends: TypeAlias = Annotated[BaseTeamJam, Depends(get_team_jam)]
