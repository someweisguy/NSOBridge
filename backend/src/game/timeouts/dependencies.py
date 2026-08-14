"""The FastAPI dependencies methods for Timeouts."""

from http import HTTPStatus
from typing import Annotated, TypeAlias

from fastapi import Depends, HTTPException, Query
from game.bouts.dependencies import GetBout

from .models import Timeout


async def _get_timeout(
    bout: GetBout,
    num: Annotated[int, Query()],
) -> Timeout:
    try:
        timeout: Timeout = bout.timeouts[num]
    except IndexError as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Timeout ({bout=} {num=})'
        ) from e

    return timeout


GetTimeout: TypeAlias = Annotated[Timeout, Depends(_get_timeout)]
