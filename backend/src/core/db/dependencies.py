"""Session dependencies to allow other modules to interact with the database."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Annotated, Any, Iterable, Literal, TypeAlias, override

from fastapi import Depends, Request
from sqlalchemy import event, inspect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstanceState, Session, attributes

from core.users import GetUser  # noqa: TC001 - Ruff is wrong.

from .constants import session_factory
from .models import BaseSQLModel, CacheableSQLModel, Memento

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from sqlalchemy.orm.attributes import History


def _take_snapshot(
    session: Session,
    obj: Any,
    now: datetime,
    operation_type: Literal['INSERT', 'UPDATE', 'DELETE'],
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
    new: set = session.info.setdefault('new', set())
    dirty: set = session.info.setdefault('dirty', set())
    if is_insert:
        records: set = new
        dirty.discard(copy)
    else:
        records: set = dirty
        new.discard(copy)
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
                await session.merge(model)
            for model in self._new:
                merged = await session.merge(model)
                if inspect(merged).persistent:
                    await session.delete(merged)
                else:
                    session.expunge(merged)

            await session.flush()  # TODO: can this be removed?

            new: set = session.info.setdefault('new', set())
            dirty: set = session.info.setdefault('dirty', set())

            await session.commit()

        return NewDatabaseMemento(new, dirty)

    @override
    async def get_cache_updates(self) -> Iterable[CacheableSQLModel]:
        async with session_factory() as session:
            updates = set()
            for model in self._dirty:
                merged = await session.merge(model)
                state: InstanceState[BaseSQLModel] = inspect(merged)
                if state.persistent:
                    attribute_names: list[str] = [
                        rel.key for rel in state.mapper.relationships
                    ]
                    await session.refresh(merged, attribute_names)
                    if isinstance(merged, CacheableSQLModel):
                        updates.add(merged)

            return updates


async def _yield_async_session(
    user: GetUser, request: Request
) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        # Add this session to Request state so CacheAPIRoute can detect cache changes
        request.state['session'] = session

        yield session

        # # Flush the session to finish collecting all mutated models
        # await session.flush()

        # # Get all mutated models in this transaction
        # new: set[BaseSQLModel] = session.info.get('new', set())
        # dirty: set[BaseSQLModel] = session.info.get('dirty', set())

        # if len(new) or len(dirty):
        #     memento = NewDatabaseMemento(new, dirty)
        #     user.stage(memento)
        #     user.commit('')

        # # Store mutated models so a cache message can be generated later
        # for record_name in ['new', 'dirty']:
        #     if record_name not in request.state:
        #         request.state[record_name] = set()
        # request.state.new |= new
        # request.state.dirty |= dirty

        await session.commit()


GetAsyncSession: TypeAlias = Annotated[
    AsyncSession,
    Depends(_yield_async_session, scope='function'),
]
"""FastAPI dependency injection which gets a session from the default session factory.

Each new session is auto-committed at the end of each endpoint and client cache keys
are automatically invalidated.
"""
