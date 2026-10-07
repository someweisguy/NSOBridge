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


async def get_bout(
    user: GetUser,
    uuid: Annotated[UUID, Query()],
) -> BaseBout:
    """Get the desired Bout.

    Args:
        user (GetUser): The User that is querying the database.
        uuid (Annotated[UUID, Query): the UUID of the desired bout.

    Raises:
        HTTPException: if no Bout is found.

    Returns:
        BaseBout: the associated Bout in the database.

    """
    statement: Select[BaseBout] = select(BaseBout).where(BaseBout.uuid == uuid)
    results: Result[BaseBout] = await user.session.execute(statement)

    try:
        bout: BaseBout = results.scalar_one()
    except NoResultFound as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Bout ({uuid=})'
        ) from e

    return bout


GetBout: TypeAlias = Annotated[BaseBout, Depends(get_bout)]


async def get_team(
    user: GetUser, uuid: Annotated[UUID, Query(alias='teamUuid')]
) -> Team:
    """Get the desired Team.

    Args:
        user (GetUser): The User that is querying the database.
        uuid (Annotated[UUID, Query): the UUID of the desired Team..

    Raises:
        HTTPException: if no Team is found.

    Returns:
        Team: the associated Team in the database.

    """
    statement: Select[Team] = select(Team).where(Team.uuid == uuid)
    results: Result[Team] = await user.session.execute(statement)

    try:
        team: Team = results.scalar_one()
        if team.bout is None:
            raise NoResultFound('This Team does not have a parent Bout.')
    except NoResultFound as e:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, f'Could not find Team ({uuid=})'
        ) from e

    # Load the parent Bout
    await get_bout(user, team.bout.uuid)

    return team


GetTeam: TypeAlias = Annotated[Team, Depends(get_team)]
