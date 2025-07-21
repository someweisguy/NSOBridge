from typing import Callable, Final

from pydantic import Field
from sqlalchemy.orm import Session

from core.models import ProjectModel

from .wftda_2025 import Referee as WFTDA_2025_REFEREE

type RefereeType = dict[str, AbstractRule | Callable[[Session], Callable[..., None]]]


REFEREES: Final[dict[str, WFTDA_2025_REFEREE]] = {'WFTDA 2025': WFTDA_2025_REFEREE()}


class AbstractRule(ProjectModel):
    db: Session = Field(exclude=True, frozen=True)