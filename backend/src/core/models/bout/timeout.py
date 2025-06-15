from typing import Literal

from pydantic import Field

from core.models.bout.team import TeamString
from core.models.time.timer import Timer, millisdelta


class Timeout[T = TeamString](Timer):
    period_num: int = Field(final=True)
    jam_num: int = Field(final=True)
    period_clock_elapsed: millisdelta = Field(final=True)
    is_review: bool = False
    team: T | Literal['official'] | None = None
    details: str = ''
    result: str = ''
    retained: bool = False
