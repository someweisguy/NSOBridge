"""The main business logic database handling."""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, Callable, Iterable, override
from uuid import UUID, uuid4

from fastapi.routing import APIRoute
from sqlalchemy import URL, Select, select

from core.app.service import get_schema

from .models import BaseSQLModel, CacheableSQLModel
from .schemas import CacheResponseSchema

if TYPE_CHECKING:
    from pathlib import Path

    from fastapi import Request, Response
    from sqlalchemy.engine.result import Result
    from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

    from core.app import ServerSchema


class CacheAPIRoute(APIRoute):
    """A FastAPI APIRoute which wraps a response in a client cache interface."""

    @staticmethod
    async def get_client_cache_updates(
        session: AsyncSession,
    ) -> list[CacheableSQLModel]:
        """Fetch the client cache updates for a given Session.

        The Session must be active.

        Args:
            session (AsyncSession): an active session.

        Returns:
            list[CacheableSQLModel]: all of the cache models that the client should
            update.

        """
        new: Iterable[BaseSQLModel] = session.info.get('new', [])
        dirty: Iterable[BaseSQLModel] = session.info.get('dirty', [])
        async with session.begin_nested():
            # Get the latest version of all dirty models
            models_and_parents: set[BaseSQLModel] = set()
            for identity_map in [new, dirty]:
                for model in identity_map:
                    cls: type[BaseSQLModel] = type(model)
                    statement: Select = select(cls).where(cls.uuid == model.uuid)
                    results: Result = await session.execute(statement)
                    updated_model: BaseSQLModel | None = results.scalar_one_or_none()
                    if updated_model is None:
                        continue

                    # Add the updated models and their parents to a collection
                    if identity_map is dirty:
                        models_and_parents.add(updated_model)
                    for parent in updated_model.get_recursive_parents():
                        if isinstance(parent, BaseSQLModel):
                            models_and_parents.add(parent)

            return [
                model
                for model in models_and_parents
                if isinstance(model, CacheableSQLModel)
            ]

    @override
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            transaction_uuid: UUID = uuid4()
            response: Response = await original_route_handler(request)

            # Get all of the models that have been updated in this transaction
            cache: list = []
            if 'session' in request.state:
                session: AsyncSession = request.state['session']
                await session.flush()

                # Serialize client cache models
                for model in await self.get_client_cache_updates(session):
                    schema: type[ServerSchema] = get_schema(type(model))
                    cache.append(  # TODO: this should be a schema
                        {
                            'key': model.cache_key(),
                            'data': schema.model_validate(model),
                        }
                    )

            # Wrap the response in cache data
            new_body = CacheResponseSchema(
                transaction_uuid=transaction_uuid,
                status_code=response.status_code,
                data=json.loads(bytes(response.body)),
                cache=cache,
            )
            response.body = new_body.model_dump_json().encode('utf-8')
            response.headers['Content-Length'] = str(len(response.body))

            return response

        return custom_route_handler


def get_database_url(file_path: str | Path) -> URL:
    """Get a URL to a database.

    Args:
        file_path (str | Path): the path to the database.

    Returns:
        URL: A formatted URL for the SQLAlchemy database.

    """
    return URL.create('sqlite+aiosqlite', database=str(file_path))


async def create_tables(engine: AsyncEngine) -> None:
    """Create the database tables for a file.

    Args:
        engine (AsyncEngine): The async engine used to connect to the file.

    """
    async with engine.begin() as connection:
        await connection.run_sync(BaseSQLModel.metadata.create_all)
