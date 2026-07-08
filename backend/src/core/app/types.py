"""TODO."""

from __future__ import annotations

import json
import typing
from datetime import datetime
from typing import Any, Iterable, Protocol, override

from fastapi.responses import JSONResponse

type CacheKey = tuple[Any, ...]
"""A cache key type used for the client model caching feature. """


class APIResponse[T: Any](JSONResponse):
    """Used to wrap all API responses in a common JSON interface.

    This class provides a wrapper for returning APISchemas in a nice way. This class is
    a subclass of the FastAPI response class and also does not require the use of
    keyword args to instantiate the response.
    """

    @override
    def render(self, content: Any) -> bytes:
        payload: dict[str, Any] = (
            content
            if isinstance(content, dict) and 'data' in content.keys()
            else {'data': content}
        )
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


@typing.runtime_checkable
class CacheableProtocol(Protocol):
    """Defines the protocol for cacheable items."""

    def get_updates(self) -> Iterable[CacheableProtocol]:
        """Get a collection of all the cacheable items that have been updated.

        Returns:
            Iterable[CacheableProtocol]: _description_

        """
        ...

    def cache_key(self) -> CacheKey:
        """Get the cache key of the cacheable.

        Returns:
            Any: _description_

        """
        ...
