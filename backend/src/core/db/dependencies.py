"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Annotated, Any, Iterable, TypeAlias, override

from fastapi import Depends
from sqlalchemy import delete, event, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstanceState, Session

from core.users import GetUser  # noqa: TC001 - Ruff is wrong.

from .constants import session_factory
from .models import BaseSQLModel, CacheableSQLModel, Memento

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy.sql.dml import Delete


@event.listens_for(Session, 'after_flush')
def _handle_flush(session: Session, flush_context) -> None:
    dirty: set[BaseSQLModel] = session.info.get('dirty', set())
    new: set[BaseSQLModel] = session.info.get('new', set())

    for i, identity_map in enumerate([session.new, session.deleted | session.dirty]):
        is_new: bool = i == 0  # This is a silly way to check for newness
        for model in identity_map:
            if not session.is_modified(model):
                continue

            instance: InstanceState = inspect(model)

            # Get a copy of all the modified models BEFORE they were modified
            attributes: dict[str, Any] = {}

            # Iterate through the columns in each model and copy it
            model_column_names = instance.mapper.column_attrs.keys()
            for name, attribute in instance.attrs.items():
                if name not in model_column_names:
                    continue  # Ignore relationship attributes
                history = attribute.load_history()
                if len(history.sum()):
                    attributes[name] = history.sum()[0]
                else:
                    attributes[name] = getattr(model, name)

            # Instantiate a copy of the model
            model_class: type[BaseSQLModel] = instance.mapper.class_
            copy: BaseSQLModel = model_class(**attributes)

            if is_new:
                new.add(copy)
                logging.debug(f'Adding {copy} to NEW session cache')
            elif copy in new:
                new.remove(copy)
                new.add(copy)
            else:
                logging.debug(f'Adding {copy} to DIRTY session cache')
                dirty.add(copy)

    session.info['dirty'] = dirty
    session.info['new'] = new


class NewDatabaseMemento(Memento):
    """A memento based on database transactions."""

    def __init__(
        self, new: Iterable[BaseSQLModel], dirty: Iterable[BaseSQLModel]
    ) -> None:
        """Initialize a database memento.

        Args:
            new (Iterable[BaseSQLModel]): a collection of the newly created models in
            this transaction.
            dirty (Iterable[BaseSQLModel]): a collection of the updated models in this
            transaction.

        """
        self._new: Iterable[BaseSQLModel] = new
        self._dirty: Iterable[BaseSQLModel] = dirty

    @override
    async def restore(self) -> Memento:
        async with session_factory() as session:
            for model in self._dirty:
                await session.merge(model)
            for model in self._new:
                model_class = type(model)
                statement: Delete = delete(model_class).where(
                    model_class.uuid == model.uuid
                )
                await session.execute(statement)

            await session.commit()

            new: Iterable[BaseSQLModel] = session.info['new']
            dirty: Iterable[BaseSQLModel] = session.info['dirty']

        return NewDatabaseMemento(new, dirty)

    @override
    async def get_cache_updates(self) -> Iterable[CacheableSQLModel]:
        from core.app.service import get_schema  # noqa # FIXME: remove me

        async with session_factory() as session:
            updates = set()
            for model in self._dirty:
                mapper = inspect(model).mapper
                relationship_names = [rel.key for rel in mapper.relationships]

                try:
                    if isinstance(model, CacheableSQLModel):
                        merged = await session.merge(model)
                        if (
                            isinstance(merged, CacheableSQLModel)
                            and not inspect(merged).persistent
                        ):
                            logging.debug(
                                f'Not adding {merged} because it is not persistent.'
                            )
                        if inspect(merged).persistent:
                            await session.refresh(merged, relationship_names)
                            updates.add(merged)
                            logging.debug(f'Adding {merged}')
                except Exception:  # noqa  # FIXME: remove noqa
                    pass

        return updates


async def _yield_async_session(user: GetUser) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session

        await session.flush()

        # Get all mutated models in this transaction
        new: set[BaseSQLModel] = session.info.get('new', set())
        dirty: set[BaseSQLModel] = session.info.get('dirty', set())

        if len(new) or len(dirty):
            memento = NewDatabaseMemento(new, dirty)
            user.stage(memento)
            user.commit('')

        # Extract the cacheable models from the session
        cacheables: set[CacheableSQLModel] = {
            model for model in dirty if isinstance(model, CacheableSQLModel)
        }
        for model in dirty:
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
