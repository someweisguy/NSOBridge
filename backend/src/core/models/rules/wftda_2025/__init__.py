from core.models.rules.protocol import Ruleset
from core.models.rules.wftda_2025.call_timeout import CallTimeout
from core.models.rules.wftda_2025.end_period import EndPeriod
from core.models.rules.wftda_2025.end_timeout import EndTimeout
from core.models.rules.wftda_2025.start_jam import StartJam
from core.models.rules.wftda_2025.stop_jam import StopJam

RULESET: Ruleset = Ruleset(
    start_jam=StartJam,
    stop_jam=StopJam,
    call_timeout=CallTimeout,
    end_timeout=EndTimeout,
    end_period=EndPeriod,
)
