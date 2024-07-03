from roller_derby.bout import Bout, Jam
from datetime import datetime
from server import API
import server


@server.register
async def setTrip(
    id: Jam.Id,
    team: Jam.TEAMS,
    tripIndex: int,
    tripPoints: int,
    timestamp: datetime,
    validPass: bool = True,
) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[id.period][id.jam]

    # Attempt to set the lead jammer
    if jam.score[team].isLeadEligible() and validPass:
        jam.score[team].setLead(True)

    jam.score[team].setTrip(tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(id: Jam.Id, team: Jam.TEAMS, tripIndex: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[id.period][id.jam]

    jam.score[team].deleteTrip(tripIndex)


@server.register
async def setLead(id: Jam.Id, team: Jam.TEAMS, lead: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[id.period][id.jam]

    jam.score[team].setLead(lead)


@server.register
async def setLost(id: Jam.Id, team: Jam.TEAMS, lost: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[id.period][id.jam]

    jam.score[team].setLost(lost)


@server.register
async def setStarPass(id: Jam.Id, team: Jam.TEAMS, tripIndex: None | int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[id.period][id.jam]

    jam.score[team].setStarPass(tripIndex)
    if tripIndex is not None:
        jam.score[team].setLost(True)
