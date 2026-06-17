"""The FastAPI dependencies methods for Timeouts."""

from typing import Annotated, TypeAlias

from core.exceptions import ModelLookupError
from core.users import GetUser
from fastapi import Depends, Query, Request
from game.bouts.dependencies import GetBout

from .models import Timeout


async def _get_timeout(
    request: Request,
    user: GetUser,
    bout: GetBout,
    num: Annotated[int, Query()],
) -> Timeout:
    try:
        timeout: Timeout = bout.timeouts[num]
    except IndexError as e:
        raise ModelLookupError(f'Could not find Timeout ({bout=} {num=})') from e

    # Optionally take a snapshot of the Timeout state
    if request.method != 'GET':
        user.stage(timeout.get_memento())
    return timeout


GetTimeout: TypeAlias = Annotated[Timeout, Depends(_get_timeout)]
