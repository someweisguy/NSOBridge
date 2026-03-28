"""# TODO: Summary goes here."""

from typing import Annotated, Final, TypeAlias

from fastapi import Depends

from game.bouts.dependencies import GetBout

from .mutate import RuleMutator
from .wftda_2025 import WFTDA2025

ALL_RULESETS: Final[dict[str, type[RuleMutator]]] = {
    'WFTDA 2025': WFTDA2025,
}


def _get_ruleset_from_bout(bout: GetBout) -> RuleMutator:
    return ALL_RULESETS[bout.ruleset_name](bout)


GetRuleset: TypeAlias = Annotated[RuleMutator, Depends(_get_ruleset_from_bout)]
