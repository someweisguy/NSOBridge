"""Dependencies for the user module."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Request, Response

from .types import User

if TYPE_CHECKING:
    from collections.abc import Generator


_users: dict[UUID, User] = {}


def _get_user(
    request: Request,
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
        user.unstage()
        raise e
    else:
        if request.method == 'GET':
            return
        endpoint: function = request.scope['endpoint']  # noqa: F821 - Ruff is wrong.
        if endpoint.__doc__ is not None:
            commit_message = endpoint.__doc__
        else:
            logging.warning(f'Endpoint `{endpoint.__name__}` does not have docs')
            commit_message = 'Unknown operation'
        user.commit(commit_message)


GetUser: TypeAlias = Annotated[User, Depends(_get_user)]
