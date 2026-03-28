"""The FastAPI dependencies methods for Teams."""

from typing import Annotated, TypeAlias

from core.exceptions import ModelLookupError
from fastapi import Depends, Query
from game.bouts.dependencies import GetBout

from .models import Team


async def _get_team(
    bout: GetBout, team_num: Annotated[int, Query(alias='teamNum')]
) -> Team:
    try:
        return bout.teams[team_num]
    except KeyError as e:
        raise ModelLookupError(f'Could not find Team ({bout=} {team_num=})') from e


GetTeam: TypeAlias = Annotated[Team, Depends(_get_team)]
