from roller_derby.score import ClientException, Bout, Jam, JamIndex
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
) -> None:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.setTrip(team, tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(jamIndex: JamIndex, team: Jam.TEAMS, tripIndex: int) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    jam.deleteTrip(team, tripIndex)


@server.register
async def setInitialPass(
    jamIndex: JamIndex, team: Jam.TEAMS, timestamp: datetime
) -> API:
    # Get the desired Bout and Jam
    bout: Bout = server.bouts.currentBout
    jam: Jam = bout[jamIndex.period][jamIndex.jam]

    # Raise an error if trying to set an invalid initial trip
    if jam.getTripCount(team) > 0:
        raise ClientException("This team has already had their initial trip.")

    # Assign lead and set the initial trip points
    if jam.isLeadEligible(team):
        jam.setLead(team, True)

    points: int = 0  # TODO: if is overtime, set to 4 points
    tripIndex: int = 0  # The initial pass
    jam.setTrip(team, tripIndex, points, timestamp)


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
