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
) -> None:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    if jam[team].isLeadEligible() and validPass:
        jam[team].setLead(True)

    jam[team].setTrip(tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(jamId: Jam.Id, team: Jam.TEAMS, tripIndex: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam[team].deleteTrip(tripIndex)


@server.register
async def setLead(jamId: Jam.Id, team: Jam.TEAMS, lead: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam[team].setLead(lead)


@server.register
async def setLost(jamId: Jam.Id, team: Jam.TEAMS, lost: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam[team].setLost(lost)


@server.register
async def setStarPass(jamId: Jam.Id, team: Jam.TEAMS, tripIndex: None | int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamId.period][jamId.jam]

    jam[team].setStarPass(tripIndex)
    if tripIndex is not None:
        jam[team].setLost(True)
