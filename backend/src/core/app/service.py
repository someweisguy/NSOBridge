"""Business logic for the core application."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Final, Type, override

from fastapi.responses import JSONResponse

if TYPE_CHECKING:
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
    def render(self, content: dict) -> bytes:
        payload: dict[str, Any] = content if 'data' in content else {'data': content}
        payload['status_code'] = self.status_code
        payload['timestamp'] = datetime.now()
        return json.dumps(
            payload,
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

    This method also registers all the subclasses of the model, if the model implements
    subclasses.

    Use as a decorator for Pydantic schemas to allow models to be dynamically
    serialized. This is needed because FastAPI doesn't natively know how to serialize
    models unless explicitly told how.

    Args:
        cls (Type[ServerSchema]): the Pydantic schema.
        model (Any): the associated model.

    """

    def _schema_decorator(cls: Type[ServerSchema]):
        _model_table[model] = cls
        for subclass in model.__subclasses__():
            _model_table[subclass] = cls
        return cls

    return _schema_decorator


def get_schema(model: Any) -> Type[ServerSchema]:
    """Get the schema registered to the desired model.

    This method automatically checks if the base class of the model has been registered
    to the model-schema lookup table. If it has, it associates the child class with its
    parent's schema. This is used for different rulesets so that a single schema may be
    associated with all ruleset class definitions.

    This method is the inverse of the `register model` decorator.

    Args:
        model (Any): the model registered to a schema.

    Raises:
        ValueError: if no such model has been registered to a schema.

    Returns:
        Type[ServerSchema]: the registered schema.

    """
    schema: Type[ServerSchema] | None = _model_table.get(model, None)

    # Dynamically add sub-classes to the lookup table
    if schema is None and issubclass(model, tuple(_model_table.keys())):
        for parent_class in model.__bases__:
            schema = _model_table.get(parent_class, None)
            if schema is not None:
                _model_table[model] = schema
                break

    if schema is None:
        raise ValueError(
            f'Found unregistered model: {model}. Was the model passed by type?'
        )
    return schema
