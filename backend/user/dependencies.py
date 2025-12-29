from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response

from .service import UserContext

if TYPE_CHECKING:
    from collections.abc import Generator


_contexts: dict[UUID, UserContext] = {}


def _get_user_context(
    response: Response,
    nso_id: Annotated[UUID | None, Cookie(alias='nsoId')] = None,
) -> Generator[UserContext, None, None]:
    # Set a UUID cookie with the browser
    if nso_id is None:
        nso_id = uuid4()
        response.set_cookie('nsoId', str(nso_id))

    # Fetch the user context from memory
    user: UserContext | None = _contexts.get(nso_id, None)
    if user is None:
        user = UserContext()
        _contexts[nso_id] = user

    try:
        yield user
    except Exception as e:
        user.reset()
        raise e
    else:
        user.commit()


UserDepends: TypeAlias = Annotated[UserContext, Depends(_get_user_context)]
