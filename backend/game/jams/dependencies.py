from typing import TYPE_CHECKING, Annotated, Literal, TypeAlias, overload

from database import AsyncSessionDepends
from fastapi import Depends, Query, Request
from game.team_jams.models import BaseTeamJam
from sqlalchemy import select
from users.dependencies import UserDepends

from .models import BaseJam

if TYPE_CHECKING:
    from sqlalchemy.engine.result import Result
    from sqlalchemy.sql.selectable import Select


@overload
async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Literal[True],
) -> BaseJam | None: ...


@overload
async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Literal[False],
) -> BaseJam: ...


async def get_jam_or_none(
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
    allow_none: Annotated[bool, Query(include_in_schema=False)] = True,
) -> BaseJam | None:
    statement: Select[tuple[BaseJam]] = (
        select(BaseJam)
        .where(BaseJam.bout_id == bout_id)
        .where(BaseJam.period == period_num)
        .where(BaseJam.num == jam_num)
    )
    results: Result[tuple[BaseJam]] = await session.execute(statement)
    return results.scalar_one_or_none() if allow_none else results.scalar_one()


async def get_jam(
    request: Request,
    user: UserDepends,
    session: AsyncSessionDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> BaseJam:
    allow_none: bool = False
    jam: BaseJam | None = await get_jam_or_none(
        session,
        bout_id,
        period_num,
        jam_num,
        allow_none,
    )
    if jam is None:
        raise IndexError('jam not found')

    # Optionally take a snapshot of the state
    if request.method != 'GET':
        user.stage(jam.get_snapshot())

    return jam


JamDepends: TypeAlias = Annotated[BaseJam, Depends(get_jam)]


async def get_team_jam(
    jam: JamDepends,
    team_id: Annotated[int, Query()],
) -> BaseTeamJam:
    team_jam: BaseTeamJam | None = next(
        (tj for tj in jam.team_jams if tj.id == team_id), None
    )
    if team_jam is None:
        raise KeyError('the specified team was not found in this Jam')
    return team_jam


TeamJamDepends: TypeAlias = Annotated[BaseTeamJam, Depends(get_team_jam)]
