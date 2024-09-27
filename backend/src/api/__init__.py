from . import *  # noqa
from . import bout, jam
from dataclasses import dataclass
from typing import Literal
from uuid import UUID
import roller_derby


@dataclass
class Id:
    type: type
    bout: UUID
    period: int | None = None
    jam: int | None = None
    team: Literal['home', 'away', 'official'] | None = None

    def __dict__(self) -> dict[str, str | int | float | bool | None]:
        dictionary: dict = {
            'type': str(type),
            'bout': str(UUID),
        }
        if self.period is not None:
            dictionary['period'] = self.period
        if self.jam is not None:
            dictionary['jam'] = self.jam
        if self.team is not None:
            dictionary['team'] = self.team
        return dictionary


def model_adapter(id: Id) -> dict:
    match id.type:
        case roller_derby.Bout:
            return bout.getBout(id.bout)
        case roller_derby.Jam:
            return jam.getJam(id.bout, id.period, id.jam)
        case _:
            raise KeyError(f'Unknown type \'{id.type.__name__}\'')
