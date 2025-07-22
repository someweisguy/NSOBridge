from dataclasses import dataclass

from core.models.rules.wftda_2025.start_jam import StartJam
from core.models.rules.wftda_2025.stop_jam import StopJam


@dataclass
class Referee:
    # add_trip
    # call_timeout
    # end_period
    # end_timeout
    # get_score
    # set_lead
    # set_lost
    # set_star_pass
    # setup_game
    start_jam: type[StartJam] = StartJam
    stop_jam: type[StopJam] = StopJam