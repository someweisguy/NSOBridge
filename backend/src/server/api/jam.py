from roller_derby import BoutId, bouts, Jam
from typing import Any
import server


@server.getter(Jam)
def getJam(boutId: BoutId, periodId: int, jamId: int) -> dict[str, Any]:
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    def encode_team(team: Jam.Team) -> dict[str, Any]:
        return {
            'lead': team.lead,
            'lost': team.lost,
            'starPass': team.star_pass,
            'trips': [{
                'timestamp': str(trip.timestamp),
                'points': trip.points
            } for trip in team.trips],
            'jammer': None,  # TODO
            'blockers': [None, None, None, None],  # TODO
            'noPivot': False,  # TODO
        }

    return {
        'startTimestamp': (str(jam.start_timestamp)
                           if jam.start_timestamp is not None else None),
        'stopTimestamp': (str(jam.stop_timestamp)
                          if jam.stop_timestamp is not None else None),
        'stopReason': jam.stop_reason,
        'home': encode_team(jam.home),
        'away': encode_team(jam.away)
    }
