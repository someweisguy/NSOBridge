import asyncio
from asyncio import Task

from core.models import BaseSQLModel, CacheableSQLModel
from sqlalchemy import event
from sqlalchemy.orm import Session

from ws.schemas import CacheWebsocketServerSchema

from .router import BACKGROUND_TASKS, CLIENTS
from .schemas import WebSocketServerSchema


def broadcast(payload: WebSocketServerSchema) -> None:
    for client in CLIENTS:
        task: Task[None] = asyncio.create_task(
            client.send_text(payload.model_dump_json())
        )
        task.add_done_callback(BACKGROUND_TASKS.discard)
        BACKGROUND_TASKS.add(task)


@event.listens_for(Session, 'before_commit')
def broadcast_updates(session: Session) -> None:
    # Recursively add each dirty, deleted, or new model
    cacheables: set[CacheableSQLModel] = {
        parent
        for model in [
            record
            for identity_map in [session.dirty, session.deleted, session.new]
            for record in identity_map
            if isinstance(record, BaseSQLModel)
        ]
        for parent in model.search_parents() | {model}
        if isinstance(parent, CacheableSQLModel)
    }

    # Broadcast model keys of all updated cacheable models to clients
    payload = CacheWebsocketServerSchema(
        [cacheable.cache_key() for cacheable in cacheables if cacheable.id is not None]
    )
    if len(payload.data) > 0:
        broadcast(payload)
