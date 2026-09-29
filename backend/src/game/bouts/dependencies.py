"""The FastAPI dependencies methods for Bouts."""

from http import HTTPStatus
from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID

from core.users import GetUser
from fastapi import Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from .models import BaseBout, Team

if TYPE_CHECKING:
    from sqlalchemy import Result, Select


async def _get_bout(
    user: GetUser,
    uuid: Annotated[UUID, Query()],
) -> BaseBout:
    statement: Select[BaseBout] = select(BaseBout).where(BaseBout.uuid == uuid)
    results: Result[BaseBout] = await user.session.execute(statement)

    try:
        bout: BaseBout = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Bout ({uuid=})'
        ) from e

    return bout


GetBout: TypeAlias = Annotated[BaseBout, Depends(_get_bout)]


async def _get_team(
    bout: GetBout, team_num: Annotated[int, Query(alias='teamNum')]
) -> Team:
    try:
        return bout.teams[team_num]
    except KeyError as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Team ({bout=} {team_num=})'
        ) from e


GetTeam: TypeAlias = Annotated[Team, Depends(_get_team)]
