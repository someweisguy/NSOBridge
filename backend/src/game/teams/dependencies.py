"""The FastAPI dependencies methods for Teams."""

from typing import Annotated, TypeAlias

from core.exceptions import ModelLookupError
from fastapi import Depends, Query
from game.bouts.dependencies import GetBout

from .models import BaseTeam


async def _get_team(bout: GetBout, team_num: Annotated[int, Query()]) -> BaseTeam:
    try:
        return bout.teams[team_num]
    except KeyError as e:
        raise ModelLookupError(
            f'There is no team number {team_num} in this Bout'
        ) from e


GetTeam: TypeAlias = Annotated[BaseTeam, Depends(_get_team)]
