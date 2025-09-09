from typing import Annotated, Final, Sequence

from fastapi import APIRouter, Depends, Query
from models.team import RosterModel
from schemas.roster import RosterSchema
from sqlalchemy import Result, select

from api.api import DatabaseDepends

router: Final[APIRouter] = APIRouter(prefix='/roster')


@router.get('', response_model=Sequence[RosterSchema])
async def get_rosters(
    db: DatabaseDepends, roster_ids: Annotated[list[int], Query(alias='rosterId')]
) -> Sequence[RosterModel]:
    if len(roster_ids) == 0:
        raise ValueError('At least one Roster ID is required')
    if len(roster_ids) != len(set(roster_ids)):
        raise ValueError('Duplicate Roster IDs are not permitted')
    results: Result[tuple[RosterModel]] = await db.execute(
        select(RosterModel).where(RosterModel.id.in_(roster_ids))
    )
    rosters: Sequence[RosterModel] = results.scalars().all()
    if len(rosters) != len(roster_ids):
        raise KeyError('Unknown Roster ID provided')
    return rosters


RostersDepends = Annotated[Sequence[RosterModel], Depends(get_rosters)]
