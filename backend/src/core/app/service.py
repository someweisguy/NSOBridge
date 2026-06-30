"""Business logic for the core application."""

from __future__ import annotations

import json
import os
import sys
from http import HTTPStatus
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Final, Mapping, Type, override

from fastapi.responses import JSONResponse

from .schemas import APISchema, CacheItemSchema

if TYPE_CHECKING:
    from starlette.background import BackgroundTask

    from core.db import CacheableSQLModel

    from .schemas import ServerSchema


_model_table: Final[dict[Any, Type[ServerSchema]]] = {}
"""Maps app models to their corresponding Pydantic schema."""


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
        cache: list[CacheableSQLModel] | None = None,
        status_code: int = HTTPStatus.OK,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        error_occurred: bool = status_code not in range(
            HTTPStatus.OK, HTTPStatus.MULTIPLE_CHOICES
        )

        if cache is not None:
            cache_data = [
                CacheItemSchema(
                    key=model.cache_key(), data=get_schema(model).model_validate(model)
                )
                for model in cache
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


def get_resource_path(relative_path: str) -> Path:
    """Get absolute path to resource, works for dev and for pyinstaller.

    Args:
        relative_path (str): the relative path of the desired resource.

    Returns:
        Path: a path to the resource.

    """
    base_path: str | Path = getattr(sys, '_MEIPASS', Path.cwd())
    return Path(os.path.join(base_path, relative_path))


def register_model(model: Any) -> Callable:
    """Register a model to be associated with the decorated Pydantic schema.

    Use as a decorator for Pydantic schemas to allow models to be dynamically
    serialized. This is needed because FastAPI doesn't natively know how to serialize
    models unless explicitly told how.

    Args:
        cls (Type[ServerSchema]): the Pydantic schema.
        model (Any): the associated model.

    """

    def _schema_decorator(cls: Type[ServerSchema]):
        _model_table[model] = cls
        return cls

    return _schema_decorator


def get_schema(model: Any) -> Type[ServerSchema]:
    """Get the schema registered to the desired model.

    This method is the inverse of the `register model` decorator.

    Args:
        model (Any): the model registered to a schema.

    Raises:
        ValueError: if no such model has been registered to a schema.

    Returns:
        Type[ServerSchema]: the registered schema.

    """
    schema: Type[ServerSchema] | None = _model_table.get(model, None)
    if schema is None:
        raise ValueError(f'Found unregistered model: {model}')
    return schema
