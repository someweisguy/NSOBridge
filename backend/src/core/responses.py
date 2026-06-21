"""Responses."""

from __future__ import annotations

import json
from http import HTTPStatus
from typing import TYPE_CHECKING, Any, Mapping, override

from fastapi.responses import JSONResponse

from .app.schemas import APISchema, CacheItemSchema
from .db import get_mutated_cache_models

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from starlette.background import BackgroundTask

    from .db import CacheableSQLModel


class APIResponse[T: Any](JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    This class provides a wrapper for returning APISchemas in a nice way. This class is
    a subclass of the FastAPI response class and also does not require the use of
    keyword args to instantiate the response.
    """

    @override
    def __init__(
        self,
        data: T,
        session: AsyncSession | None = None,
        status_code: int = HTTPStatus.OK,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        error_occurred: bool = status_code not in range(
            HTTPStatus.OK, HTTPStatus.MULTIPLE_CHOICES
        )

        if session is not None:
            models: list[CacheableSQLModel] = get_mutated_cache_models(session)
            cache_data = [
                CacheItemSchema(key=model.cache_key(), data=model.serialize())
                for model in models
            ]
        else:
            cache_data = []

        super().__init__(
            APISchema(
                status_code=status_code,
                error=data if error_occurred else None,
                data=data if not error_occurred else None,
                cache=cache_data,
            ).model_dump(),
            status_code,
            headers,
            media_type,
            background,
        )

    @override
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
            default=(str),  # Serialize datetime objects
        ).encode('utf-8')
