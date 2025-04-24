import json
from datetime import datetime
from typing import Any, Final

from fastapi import status
from fastapi.responses import JSONResponse


class APIResponse(JSONResponse):
    def __init__(
        self,
        content=None,
        status_code=status.HTTP_200_OK,
        headers=None,
        media_type=None,
        background=None,
    ):
        self._timestamp: Final[datetime] = datetime.now()
        super().__init__(content, status_code, headers, media_type, background)

    def render(self, content: Any) -> bytes:
        return json.dumps(
            {
                'success': self.status_code == status.HTTP_200_OK,
                'data': content,
                'timestamp': self._timestamp.isoformat(),
            },
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(',', ':'),
        ).encode('utf-8')
