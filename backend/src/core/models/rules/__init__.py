from __future__ import annotations

from typing import Annotated, Final

from fastapi import Depends

from core.models.bout import Bout, bouts
from core.models.rules.protocol import Ruleset
from core.models.rules.wftda_2025 import RULESET as WFTDA_2025_RULESET


def _ruleset_depends(bout_id: str) -> Ruleset:
    bout: Bout = bouts[bout_id]
    return RULESETS[bout.ruleset_name]


RulesetDepend = Annotated[Ruleset, Depends(_ruleset_depends)]


RULESETS: Final[dict[str, Ruleset]] = {'WFTDA 2025': WFTDA_2025_RULESET}
