from typing import Callable, Final

from sqlalchemy.orm import Session
from wftda_2025 import REFEREE as WFTDA_2025_REFEREE

type RefereeType = dict[str, Callable[[Session], Callable[..., None]]]


REFEREES: Final[dict[str, RefereeType]] = {'WFTDA 2025': WFTDA_2025_REFEREE}