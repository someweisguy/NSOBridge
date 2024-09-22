'''from datetime import datetime
from roller_derby import Series, Bout, Jam, TEAMS
import backend.src.server.host as host


@host.register
async def setTrip(uri: URI, team: TEAMS, tripNum: int, points: int,
                  timestamp: datetime, validPass: bool = True) -> API:
    # Get the desired Bout and Jam
    bout: Bout = series.currentBout
    jam: Jam = bout[uri.period][uri.jam]

    # Attempt to set the lead jammer
    if jam.score[team].isLeadEligible() and validPass:
        jam.score[team].lead = True

    jam.score[team].setTrip(tripNum, points, timestamp)


@host.register
async def deleteTrip(uri: URI, team: TEAMS, tripNum: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = series.currentBout
    jam: Jam = bout[uri.period][uri.jam]

    jam.score[team].deleteTrip(tripNum)


@host.register
async def setLead(uri: URI, team: TEAMS, lead: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = series.currentBout
    jam: Jam = bout[uri.period][uri.jam]

    jam.score[team].lead = lead


@host.register
async def setLost(uri: URI, team: TEAMS, lost: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = series.currentBout
    jam: Jam = bout[uri.period][uri.jam]

    jam.score[team].lost = lost


@host.register
async def setStarPass(uri: URI, team: TEAMS, tripNum: None | int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = series.currentBout
    jam: Jam = bout[uri.period][uri.jam]

    jam.score[team].starPass = tripNum
    if tripNum is not None:
        jam.score[team].lost = True
'''
