"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from typing import TYPE_CHECKING, Annotated, Any, TypeAlias

from fastapi import Depends
from sqlalchemy import event, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstanceState, Session

from .constants import session_factory
from .models import BaseSQLModel, CacheableSQLModel

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


@event.listens_for(Session, 'after_flush')
def _handle_flush(session: Session, flush_context) -> None:

    dirty: set[BaseSQLModel] = session.info.get('dirty', set())
    new: set[BaseSQLModel] = session.info.get('new', set())

    for i, identity_map in enumerate([session.new, session.deleted | session.dirty]):
        is_new: bool = i == 0  # This is a silly way to check for newness
        for model in identity_map:
            instance: InstanceState = inspect(model)

            # Get a copy of all the modified models BEFORE they were modified
            attributes: dict[str, Any] = {}

            # Iterate through the non-relationship columns in each model and copy it
            model_column_names = instance.mapper.column_attrs.keys()
            for name, attribute in instance.attrs.items():
                if name not in model_column_names:
                    continue
                history = attribute.load_history()
                if is_new:
                    attributes[name] = history.added
                else:
                    attributes[name] = (
                        history.deleted if history.has_changes() else history.unchanged
                    )

            # Instantiate a copy of the model
            model_class: type[BaseSQLModel] = instance.mapper.class_
            copy: BaseSQLModel = model_class(**attributes)

            if is_new:
                new.add(copy)
            else:
                dirty.add(copy)

    # TODO: check if any models in new are part of dirty
    # If a model is found in `dirty` that is also in `new`, replace new model with the
    # dirty model in the `new` set.
    if len(new):
        for model in dirty:
            if model in new:
                pass

    session.info['dirty'] = dirty
    session.info['new'] = new


async def _yield_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session

        # Get a list of query keys to invalidate before committing the session
        models: set[BaseSQLModel] = {
            model
            for identity_map in [session.dirty]
            for model in identity_map
            if isinstance(model, BaseSQLModel)
        }

        # Extract the cacheable models from the session
        cacheables: set[CacheableSQLModel] = {
            model for model in models if isinstance(model, CacheableSQLModel)
        }
        for model in models:
            cacheables |= {
                parent
                for parent in model.get_recursive_parents()
                if isinstance(parent, CacheableSQLModel)
            }

        await session.commit()


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session, scope='function'),
]
"""FastAPI dependency injection which gets a session from the default session factory.

Each new session is auto-committed at the end of each endpoint and client cache keys
are automatically invalidated.
"""
