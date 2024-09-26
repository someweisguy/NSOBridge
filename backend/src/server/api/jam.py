from datetime import datetime
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


@server.register
def setTrip(boutId: BoutId, periodId: int, jamId: int, team: str,
            tripNum: int, points: int, timestamp: datetime,
            validPass: bool = True) -> dict[str, Any]:
    ...
    # # Get the desired Bout and Jam
    # bout: Bout = series.currentBout
    # jam: Jam = bout[uri.period][uri.jam]

    # # Attempt to set the lead jammer
    # if jam.score[team].isLeadEligible() and validPass:
    #     jam.score[team].lead = True

    # jam.score[team].setTrip(tripNum, points, timestamp)


@server.register
def deleteTrip(boutId: BoutId, periodId: int, jamId: int, team: str,
               tripNum: int) -> dict[str, Any]:
    ...
    # # Get the desired Bout and Jam
    # bout: Bout = series.currentBout
    # jam: Jam = bout[uri.period][uri.jam]

    # jam.score[team].deleteTrip(tripNum)


@server.register
def setLead(boutId: BoutId, periodId: int, jamId: int, team: str,
            lead: bool) -> dict[str, Any]:
    ...
    # # Get the desired Bout and Jam
    # bout: Bout = series.currentBout
    # jam: Jam = bout[uri.period][uri.jam]

    # jam.score[team].lead = lead


@server.register
def setLost(boutId: BoutId, periodId: int, jamId: int, team: str,
            lost: bool) -> dict[str, Any]:
    ...
    # # Get the desired Bout and Jam
    # bout: Bout = series.currentBout
    # jam: Jam = bout[uri.period][uri.jam]

    # jam.score[team].lost = lost


@server.register
def setStarPass(boutId: BoutId, periodId: int, jamId: int, team: str,
                tripNum: int) -> dict[str, Any]:
    ...
    # # Get the desired Bout and Jam
    # bout: Bout = series.currentBout
    # jam: Jam = bout[uri.period][uri.jam]

    # jam.score[team].starPass = tripNum
    # if tripNum is not None:
    #     jam.score[team].lost = True
