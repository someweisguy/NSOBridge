"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Any, Iterable, Literal, TypeAlias, override

from fastapi import Depends, Request
from sqlalchemy import event, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, attributes

from core.app import Memento
from core.users import GetUser  # noqa: TC001 - FastAPI requires this at runtime

from .constants import session_factory
from .models import BaseSQLModel

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy.orm.attributes import History
    from sqlalchemy.orm.mapper import Mapper
    from sqlalchemy.orm.state import InstanceState


def _take_snapshot(
    session: Session,
    model: BaseSQLModel,
    now: datetime,
    operation_type: Literal['INSERT', 'UPDATE', 'DELETE'],
) -> None:
    cls: type[BaseSQLModel] = type(model)
    mapper: Mapper[BaseSQLModel] = inspect(cls)
    state: InstanceState[BaseSQLModel] = attributes.instance_state(model)

    # Ensure this model should have a snapshot created
    if operation_type in ('INSERT', 'DELETE'):
        should_snapshot = True
    else:
        # FastAPI doesn't report `delete-orphan` relationships as being deleted during
        # `before-flush` or `after-flush` events. They are reported as dirty due to
        # their relationship being updated. Therefore, if a model is reported as dirty
        # and it has no parents we should snapshot it since this means that the model is
        # being deleted.
        has_parents: bool = any(parent is not None for parent in model.get_parents())
        should_snapshot: bool = (
            any(
                attributes.get_history(model, col.key).added
                for col in mapper.column_attrs
            )
            or not has_parents
        )
    if not should_snapshot:
        return

    is_insert: bool = operation_type == 'INSERT'
    """This is an INSERT operation."""

    # Create a copy of this model
    data: dict[str, Any] = {}
    for col in mapper.column_attrs:
        # Prevent MissingGreenlet for lazy-loaded or deferred columns
        if col.key in state.unloaded:
            val = None
        else:
            history: History = state.attrs[col.key].load_history()
            val: Any = history.sum()[-1]
        data[col.key] = val
    copy: BaseSQLModel = cls(**data)

    # Add the copy to the session information cache
    # Dirty models that are already in `new` should not be discarded from `new`
    new: set = session.info.setdefault('new', set())
    dirty: set = session.info.setdefault('dirty', set())
    if is_insert:
        records: set = new
        dirty.discard(copy)
    elif copy in new:
        records: set = new
        new.discard(copy)
    else:
        records: set = dirty
        new.discard(copy)
    records.add(copy)


@event.listens_for(Session, 'before_flush')
def _handle_before_flush(session: Session, flush_context: Any, _) -> None:
    now: datetime = datetime.now()

    # Defer snapshots of new objects until after flush
    new_models: list[BaseSQLModel] = [
        model for model in session.new if isinstance(model, BaseSQLModel)
    ]
    if new_models:
        session.info.setdefault('_temp_new_buffer', []).extend(new_models)

    # Snapshot the current state of dirty and deleted objects
    for obj in session.dirty:
        if isinstance(obj, BaseSQLModel):
            _take_snapshot(session, obj, now, 'UPDATE')
    for obj in session.deleted:
        if isinstance(obj, BaseSQLModel):
            _take_snapshot(session, obj, now, 'DELETE')


@event.listens_for(Session, 'after_flush')
def _handle_after_flush(session: Session, flush_context: Any) -> None:
    now: datetime = datetime.now()

    # Collect the mutated models for client cache updates
    cache: set[BaseSQLModel] = session.info.setdefault('cache', set())
    for model in session.dirty:
        if isinstance(model, BaseSQLModel):
            cache.update([model, *model.get_recursive_parents()])
    for model in session.deleted:
        if isinstance(model, BaseSQLModel):
            cache.update(model.get_recursive_parents())

    # Snapshot deferred inserts
    new_models: list[BaseSQLModel] = session.info.pop('_temp_new_buffer', [])
    for model in new_models:
        _take_snapshot(session, model, now, 'INSERT')


class DatabaseMemento(Memento):
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
    async def restore(self, request: Request) -> Memento:
        if 'session' in request.state:
            raise ValueError('session already exists')
        async with session_factory() as session:
            request.state['session'] = session

            # Reset the database state as described in this Memento
            new: set[BaseSQLModel] = set()
            for model in self._dirty:
                merged = await session.merge(model)
                if not inspect(merged).persistent:
                    new.add(merged)
            for model in self._new:
                merged = await session.merge(model)
                if inspect(merged).persistent:
                    await session.delete(merged)
                else:
                    session.expunge(merged)

            # Manually add new models to the client cache updates
            await session.flush()
            cache: set[BaseSQLModel] = session.info.setdefault('cache', set())
            for model in new:
                await session.refresh(model)
                cache.update([model, *model.get_recursive_parents()])

            new: set[BaseSQLModel] = session.info.setdefault('new', set())
            dirty: set = session.info.setdefault('dirty', set())

            await session.commit()

        return DatabaseMemento(new, dirty)


async def _yield_async_session(
    request: Request, user: GetUser
) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        # Add this session to Request state so CacheAPIRoute can detect cache changes
        request.state['session'] = session

        yield session

        await session.flush()

        # Create a database memento
        new: set[BaseSQLModel] = session.info.get('new', set())
        dirty: set[BaseSQLModel] = session.info.get('dirty', set())

        await session.commit()

    if new or dirty:
        memento = DatabaseMemento(new, dirty)
        user.stage(memento)


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session, scope='function'),
]
"""FastAPI dependency injection which gets a session from the default session factory.

Each new session is auto-committed at the end of each endpoint and client cache keys
are automatically invalidated.
"""
