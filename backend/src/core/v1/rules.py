from typing import Annotated, Callable, Final

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.models.game import SESSION_READ_ONLY, get_bout, get_db
from core.models.game.bout import SQLBout
from core.models.rules.referees import REFEREES
from core.models.rules.wftda_2025 import Referee

DatabaseDepends = Annotated[Session, Depends(get_db)]
BoutDepends = Annotated[SQLBout, Depends(get_bout)]


router: Final[APIRouter] = APIRouter(prefix='/rules')


# TODO: async def get_series()


@router.post('/start-jam')
async def start_jam(db: DatabaseDepends, bout: BoutDepends) -> dict:
    # Get the appropriate Referee for the specified Bout
    referee: Referee | None = REFEREES.get(bout.ruleset)
    if referee is None:
        raise KeyError(f'Referee not found ({bout.ruleset=})')

    # Instantiate the Rule, set the session to read-only, and call the Rule
    rule: Callable = referee.start_jam(db=db)
    db.info[SESSION_READ_ONLY] = True
    response: dict = rule(bout)
    db.info[SESSION_READ_ONLY] = False

    # TODO: Post the updated objects to the Updater

    db.commit()

    return response


__all__ = ('router',)
