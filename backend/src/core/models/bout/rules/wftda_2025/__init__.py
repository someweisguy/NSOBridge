from __future__ import annotations

from core.models.bout.bout import Referee
from core.models.bout.rules.wftda_2025.call_timeout import CallTimeout
from core.models.bout.rules.wftda_2025.end_period import EndPeriod
from core.models.bout.rules.wftda_2025.end_timeout import EndTimeout
from core.models.bout.rules.wftda_2025.start_jam import StartJam
from core.models.bout.rules.wftda_2025.stop_jam import StopJam


def referee_factory() -> Referee:
    return Referee(
        name='WFTDA 2025',
        start_jam=StartJam(),
        stop_jam=StopJam(),
        call_timeout=CallTimeout(),
        end_timeout=EndTimeout(),
        end_period=EndPeriod(),
    )
