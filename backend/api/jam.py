from datetime import datetime
from typing import Annotated, Final

from commands import HistoryDepends
from commands._jam import AddTrip
from fastapi import APIRouter, Body, Depends, Query
from models import DatabaseDepends, JamModel
from models.jam import TripEventModel
from schemas import JamSchema
from sqlalchemy import select

router: Final[APIRouter] = APIRouter(prefix='/jam')


@router.get('', response_model=JamSchema)
async def get_jam(
    db: DatabaseDepends,
    bout_id: Annotated[int, Query(alias='boutId')],
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> JamModel:
    statement = select(JamModel).where(
        JamModel.bout_id == bout_id
        and JamModel.period == period_num
        and JamModel.jam == jam_num
    )
    results = await db.execute(statement)
    return results.scalar_one()


JamDepends = Annotated[JamModel, Depends(get_jam)]


@router.post('/add-trip')
async def add_trip(jam: JamDepends, history: HistoryDepends) -> None:
    # TODO: make commands dataclasses
    # FIXME: remove this test endpoint
    trip = TripEventModel(timestamp=datetime.now(), passes=4)
    await history.execute(AddTrip(jam.home, trip))


__all__ = ('router',)
