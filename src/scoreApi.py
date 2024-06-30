from roller_derby.bout import Bout, Jam
from datetime import datetime
from server import API
import server


@server.register
async def setTrip(
    jamId: Jam.Id,
    team: Jam.TEAMS,
    tripIndex: int,
    tripPoints: int,
    timestamp: datetime,
    validPass: bool = True,
) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    # Attempt to set the lead jammer
    if jam.score[team].isLeadEligible() and validPass:
        jam.score[team].setLead(True)

    jam.score[team].setTrip(tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(jamId: Jam.Id, team: Jam.TEAMS, tripIndex: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam.score[team].deleteTrip(tripIndex)


@server.register
async def setLead(jamId: Jam.Id, team: Jam.TEAMS, lead: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam.score[team].setLead(lead)


@server.register
async def setLost(jamId: Jam.Id, team: Jam.TEAMS, lost: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam.score[team].setLost(lost)


@server.register
async def setStarPass(jamId: Jam.Id, team: Jam.TEAMS, tripIndex: None | int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam.score[team].setStarPass(tripIndex)
    if tripIndex is not None:
        jam.score[team].setLost(True)
