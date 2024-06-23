from roller_derby.score import ClientException, Bout, Jam, JamIndex
from datetime import datetime
import server


@server.register
async def setTrip(
    jamIndex: JamIndex,
    team: str,
    tripIndex: int,
    tripPoints: int,
    timestamp: datetime,
) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]

    teamJam.setTrip(tripIndex, tripPoints, timestamp)


@server.register
async def deleteTrip(jamIndex: JamIndex, team: str, tripIndex: int) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]

    teamJam.deleteTrip(tripIndex)


@server.register
async def setInitialPass(
    jamIndex: JamIndex, team: str, timestamp: datetime
) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]

    # Raise an error if trying to set an invalid initial trip
    if len(teamJam.trips):
        raise ClientException("This team has already had their initial trip.")

    # Assign lead and set the initial trip points
    try:
        teamJam.lead = True  # TODO: remove try/except
    except ClientException:
        pass
    # Set the trip using timestamp calculated from the client latency
    points: int = 0  # TODO: if is overtime, set to 4 points
    teamJam.setTrip(0, points, timestamp)


@server.register
async def setLead(jamIndex: JamIndex, team: str, lead: bool) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]
    teamJam.lead = lead


@server.register
async def setLost(jamIndex: JamIndex, team: str, lost: bool) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]
    teamJam.lost = lost


@server.register
async def setStarPass(
    jamIndex: JamIndex, team: str, tripIndex: None | int
) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[jamIndex.period][jamIndex.jam]
    teamJam: Jam.Team = jam[team]
    teamJam.starPass = tripIndex
    if tripIndex is not False:
        teamJam.lost = True
