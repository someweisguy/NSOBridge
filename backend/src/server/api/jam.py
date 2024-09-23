from roller_derby import BoutId, bouts, Jam
from typing import Any
import server


@server.getter(Jam)
def getJam(boutId: BoutId, periodId: int, jamId: int) -> dict[str, Any]:
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    def encode_team(t: Jam.Team) -> dict[str, Any]:
        return {
            'lead': t.lead,
            'lost': t.lost,
            'starPass': t.star_pass,
            'trips': [{
                'timestamp': str(trip.timestamp),
                'points': trip.points
            } for trip in t.trips],
            'jammer': None,  # TODO
            'blockers': [None, None, None, None],  # TODO
            'noPivot': False,  # TODO
        }

    return {
        'startTimestamp': (str(jam.start) if jam.start is not None
                           else None),
        'stopTimestamp': (str(jam.stop) if jam.stop is not None
                          else None),
        'stopReason': jam.stop_reason,
        'home': encode_team(jam.home),
        'away': encode_team(jam.away)
    }
