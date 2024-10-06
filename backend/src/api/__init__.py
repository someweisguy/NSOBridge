from __future__ import annotations
from typing import Any
from uuid import UUID


class Id(dict[str, Any]):
    def __init__(self, bout_id: UUID | str | None = None,
                 jam_id: tuple[int, int] | None = None) -> None:
        super().__init__()
        if bout_id is not None:
            self['boutId'] = str(bout_id)
        if jam_id is not None:
            self['jamId'] = jam_id

    @property
    def bout_id(self) -> str | None:
        if 'boutId' in self.keys():
            return self['boutId']
        return None

    @property
    def jam_id(self) -> tuple[int, int] | None:
        if 'jamId' in self.keys():
            return self['jamId']
        return None


if __name__ != '__main__':
    from . import bout, jam, series  # noqa
