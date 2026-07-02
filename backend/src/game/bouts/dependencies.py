"""The FastAPI dependencies methods for Bouts."""

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID

from core.db import GetAsyncSession
from core.exceptions import ModelLookupError
from core.users import GetUser
from fastapi import Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from .models import BaseBout, Team

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_bout(
    request: Request,
    user: GetUser,
    session: GetAsyncSession,
    bout_uuid: Annotated[UUID, Query(alias='boutUuid')],
) -> BaseBout:
    statement: Select[tuple[BaseBout]] = select(BaseBout).where(
        BaseBout.uuid == bout_uuid
    )
    results: Result[tuple[BaseBout]] = await session.execute(statement)

    try:
        bout: BaseBout = results.scalar_one()
    except NoResultFound as e:
        raise ModelLookupError(f'Could not find Bout ({bout_uuid=})') from e

    # Optionally take a snapshot of the Bout state and return the Bout
    if request.method != 'GET':
        user.stage(bout.get_memento())
    return bout


GetBout: TypeAlias = Annotated[BaseBout, Depends(_get_bout)]


async def _get_team(
    bout: GetBout, team_num: Annotated[int, Query(alias='teamNum')]
) -> Team:
    try:
        return bout.teams[team_num]
    except KeyError as e:
        raise ModelLookupError(f'Could not find Team ({bout=} {team_num=})') from e


GetTeam: TypeAlias = Annotated[Team, Depends(_get_team)]
