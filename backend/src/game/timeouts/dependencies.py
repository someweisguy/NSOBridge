"""The FastAPI dependencies methods for Timeouts."""

from typing import Annotated, TypeAlias

from core.exceptions import ModelLookupError
from fastapi import Depends, Query, Request
from game.bouts.dependencies import GetBout
from user import GetUser

from .models import BaseTimeout


async def _get_timeout(
    request: Request,
    user: GetUser,
    bout: GetBout,
    num: Annotated[int, Query()],
) -> BaseTimeout:
    try:
        timeout: BaseTimeout = bout.timeouts[num]
    except KeyError as e:
        raise ModelLookupError(f'Could not find Timeout {num} in this Bout') from e

    # Optionally take a snapshot of the Timeout state
    if request.method != 'GET':
        user.stage(timeout.get_memento())
    return timeout


GetTimeout: TypeAlias = Annotated[BaseTimeout, Depends(_get_timeout)]
