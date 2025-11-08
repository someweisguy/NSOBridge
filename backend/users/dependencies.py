from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, TypeAlias
from uuid import UUID, uuid4

from fastapi import Cookie, Depends, Response

from users.service import UserContext

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
    context: UserContext | None = _contexts.get(nso_id, None)
    if context is None:
        context = UserContext()
        _contexts[nso_id] = context

    context.reset()  # Clear uncommitted mementos
    yield context
    context.commit()


UserDepends: TypeAlias = Annotated[UserContext, Depends(_get_user_context)]
