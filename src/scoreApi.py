from roller_derby.score import Bout, Jam, JamIndex
from datetime import datetime
from server import API
import server


@server.register
async def setTrip(
    jamIndex: JamIndex,
    team: Jam.TEAMS,
    tripIndex: int,
    tripPoints: int,
    timestamp: datetime,
    validPass: bool = True,
) -> None:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    if jam.isLeadEligible(team) and validPass:
        jam.setLead(team, True)

    jam.setTrip(team, tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(jamIndex: JamIndex, team: Jam.TEAMS, tripIndex: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.deleteTrip(team, tripIndex)


@server.register
async def setLead(jamIndex: JamIndex, team: Jam.TEAMS, lead: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.setLead(team, lead)


@server.register
async def setLost(jamIndex: JamIndex, team: Jam.TEAMS, lost: bool) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.setLost(team, lost)


@server.register
async def setStarPass(
    jamIndex: JamIndex, team: Jam.TEAMS, tripIndex: None | int
) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.setStarPass(team, tripIndex)
    if tripIndex is not None:
        jam.setLost(team, True)
