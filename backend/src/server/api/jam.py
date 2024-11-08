from datetime import datetime, timedelta
from roller_derby import BoutId, bouts, Jam
from typing import Any
import server


def get(boutId: BoutId, jamId: tuple[int, int]) -> dict[str, Any]:
    jam: Jam = bouts[boutId].jams[jamId]

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


def setTrip(boutId: BoutId, periodId: int, jamId: int, team: str,
            tripNum: int, points: int, latency: timedelta,
            validPass: bool = True) -> None:
    now: datetime = datetime.now() - latency
    id: Id = Id(boutId, (periodId, jamId))
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    # Attempt to set the lead jammer and add the Trip
    if not jam[team].lost and validPass:
        jam[team].lead = True
    jam[team].add_trip(now, points)  # FIXME: add Trip vs edit Trip

    server.add_update('bout', id)


def deleteTrip(boutId: BoutId, periodId: int, jamId: int, team: str,
               tripNum: int) -> None:
    id: Id = Id(boutId, (periodId, jamId))
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    jam[team].delete_trip(tripNum)

    server.add_update('jam', id)


def setLead(boutId: BoutId, periodId: int, jamId: int, team: str,
            lead: bool) -> None:
    id: Id = Id(boutId, (periodId, jamId))
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    if jam[team].other.lead:
        raise RuntimeError('There is already a lead Jammer for this Jam')
    jam[team].lead = lead

    server.add_update('jam', id)


def setLost(boutId: BoutId, periodId: int, jamId: int, team: str,
            lost: bool) -> None:
    id: Id = Id(boutId, (periodId, jamId))
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    jam[team].lost = lost

    server.add_update('jam', id)


def setStarPass(boutId: BoutId, periodId: int, jamId: int, team: str,
                tripNum: int) -> None:
    id: Id = Id(boutId, (periodId, jamId))
    jam: Jam = bouts[boutId].jams[periodId][jamId]

    jam[team].star_pass = tripNum
    if tripNum is not None:
        jam[team].lost = True

    server.add_update('jam', id)
