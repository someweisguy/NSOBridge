from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response

from .service import User

if TYPE_CHECKING:
    from collections.abc import Generator


_users: dict[UUID, User] = {}


def _get_user(
    response: Response,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> Generator[User, None, None]:
    # Set a UUID cookie with the browser
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))

    # Fetch the user context from memory
    user: User | None = _users.get(nso_id, None)
    if user is None:
        user = User()
        _users[nso_id] = user

    try:
        yield user
    except Exception as e:
        user.reset()
        raise e
    else:
        user.commit()


GetUser: TypeAlias = Annotated[User, Depends(_get_user)]
