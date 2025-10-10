from collections.abc import Sequence
from typing import Annotated, Final

from fastapi import APIRouter, Depends, Query
from models.team import RosterModel
from schemas.roster import RosterSchema
from sqlalchemy import Result, select

from .api import DatabaseDepends

router: Final[APIRouter] = APIRouter(prefix='/roster')


@router.get('', response_model=list[RosterSchema])
async def get_rosters(
    db: DatabaseDepends, roster_ids: Annotated[list[int], Query(alias='rosterId')]
) -> Sequence[RosterModel]:
    results: Result[tuple[RosterModel]] = await db.execute(
        select(RosterModel).where(RosterModel.id.in_(roster_ids))
    )
    rosters: Sequence[RosterModel] = results.scalars().all()
    return rosters


RosterDepends = Annotated[Sequence[RosterModel], Depends(get_rosters)]
