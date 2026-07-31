"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Any, Iterable, TypeAlias, override

from fastapi import Depends
from sqlalchemy import delete, event, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, attributes

from core.users import GetUser  # noqa: TC001 - Ruff is wrong.

from .constants import session_factory
from .models import BaseSQLModel, CacheableSQLModel, Memento

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy.orm.attributes import History
    from sqlalchemy.sql.dml import Delete


def _take_snapshot(
    session: Session, obj: Any, now: datetime, operation_type: str
) -> None:
    cls = type(obj)
    mapper = inspect(cls)
    state = attributes.instance_state(obj)

    # Ensure this model should have a snapshot created
    if operation_type in ('INSERT', 'DELETE'):
        should_snapshot = True
    else:
        should_snapshot: bool = any(
            attributes.get_history(obj, col.key).added for col in mapper.column_attrs
        )
    if not should_snapshot:
        return

    is_insert: bool = operation_type == 'INSERT'
    """This is an INSERT operation."""

    # Create a copy of this model
    data: dict[str, Any] = {}
    for col in mapper.column_attrs:
        # Prevent MissingGreenlet for lazy loaded / deferred columns
        if col.key in state.unloaded:
            val = None
        else:
            history: History = state.attrs[col.key].load_history()
            if is_insert:
                # Doesn't matter what value the column has
                val = history.sum()[0]
            else:
                val = history.non_added()[0]

        data[col.key] = val
    copy = cls(**data)

    # Add the copy to the session information cache
    if is_insert:
        records: set = session.info.setdefault('new', set())
    else:
        records: set = session.info.setdefault('dirty', set())
    records.add(copy)


@event.listens_for(Session, 'before_flush')
def _handle_before_flush(session: Session, flush_context: Any, instances: Any) -> None:
    """``before_flush`` handler — tracks updates and deletes, and buffers inserts."""
    now: datetime = datetime.now()

    # Buffer new instances for after_flush to capture DB-generated PKs and defaults
    new_objs = [obj for obj in session.new if isinstance(obj, BaseSQLModel)]
    if new_objs:
        session.info.setdefault('sa_versioning_new', []).extend(new_objs)

    for obj in list(session.dirty):
        if isinstance(obj, BaseSQLModel):
            _take_snapshot(session, obj, now, 'UPDATE')

    for obj in list(session.deleted):
        if isinstance(obj, BaseSQLModel):
            _take_snapshot(session, obj, now, 'DELETE')


@event.listens_for(Session, 'after_flush')
def _handle_after_flush(session: Session, flush_context: Any) -> None:
    """``after_flush`` handler — inserts version records for buffered inserts."""
    new_objs = session.info.pop('sa_versioning_new', [])
    if not new_objs:
        return

    now = datetime.now()
    for obj in new_objs:
        _take_snapshot(session, obj, now, 'INSERT')


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
                merged = await session.merge(model)
            for model in self._new:
                merged = await session.merge(model)
                if inspect(merged).persistent:
                    await session.delete(merged)
                else:
                    session.expunge(merged)

                model_class = type(merged)
                statement: Delete = delete(model_class).where(
                    model_class.uuid == merged.uuid
                )
                await session.execute(statement)

            await session.flush()

            new: Iterable[BaseSQLModel] = session.info.get('new', [])
            dirty: Iterable[BaseSQLModel] = session.info.get('dirty', [])

            await session.commit()

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
