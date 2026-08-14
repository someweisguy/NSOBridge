"""Dependencies for the user module."""

from __future__ import annotations

import logging
from typing import Annotated, AsyncGenerator, Callable, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Request, Response

from core.db import BaseSQLModel, DatabaseMemento, GetAsyncSession

from .types import User

_users: dict[UUID, User] = {}


async def _get_user(
    request: Request,
    response: Response,
    session: GetAsyncSession,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> AsyncGenerator[User, None]:
    # Set a UUID cookie with the browser
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))

    # Fetch the user context from memory
    user: User = _users.setdefault(nso_id, User(session))
    user.session = session
    request.scope['user'] = user

    try:
        yield user
        await session.flush()
    except Exception:
        user.unstage()
        raise

    # Create a database memento
    new: set[BaseSQLModel] = session.info.get('new', set())
    dirty: set[BaseSQLModel] = session.info.get('dirty', set())

    if new or dirty:
        memento = DatabaseMemento(new, dirty)
        user.stage(memento)

    # Don't commit when undo/redo is called or when app state hasn't changed
    endpoint_name: str = request.scope['path'].split('/')[-1].lower()
    if endpoint_name in ['undo', 'redo']:
        return
    if not user.staged():
        return

    # Get a commit message from the docstring of the endpoint method
    endpoint: Callable = request.scope['endpoint']
    if endpoint.__doc__ is not None:
        commit_message: str = endpoint.__doc__
    else:
        name: str = getattr(endpoint, '__name__', 'Unknown Method')
        logging.warning(f'Endpoint `{name}` does not have docs')
        commit_message = 'Unknown operation'

    user.commit(commit_message)


GetUser: TypeAlias = Annotated[User, Depends(_get_user)]
