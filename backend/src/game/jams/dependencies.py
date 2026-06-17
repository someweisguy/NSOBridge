"""The FastAPI dependencies methods for Jams."""

from typing import Annotated, TypeAlias

from core.exceptions import ModelLookupError
from core.users import GetUser
from fastapi import Depends, Query, Request
from game.bouts.dependencies import GetBout

from .models import Jam


async def _get_jam(
    request: Request,
    user: GetUser,
    bout: GetBout,
    period_num: Annotated[int, Query(alias='periodNum')],
    jam_num: Annotated[int, Query(alias='jamNum')],
) -> Jam:
    try:
        jam: Jam = next(
            jam for jam in bout.jams if jam.period == period_num and jam.num == jam_num
        )
    except StopIteration as e:
        raise ModelLookupError(
            f'Could not find Jam ({bout=} {period_num=} {jam_num=})'
        ) from e

    if request.method != 'GET':
        user.stage(jam.get_memento())

    return jam


GetJam: TypeAlias = Annotated[Jam, Depends(_get_jam)]
