from roller_derby.score import ClientException, Bout, Jam
from datetime import datetime
import server


@server.register
async def setTrip(
    periodIndex: int,
    jamIndex: int,
    team: str,
    tripIndex: int,
    tripPoints: int,
    timestamp: datetime,
) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
    teamJam: Jam.Team = jam[team]

    teamJam.setTrip(tripIndex, tripPoints, timestamp)

    await server.emit("jam", jam.encode())


@server.register
async def deleteTrip(
    periodIndex: int, jamIndex: int, team: str, tripIndex: int
) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
    teamJam: Jam.Team = jam[team]

    teamJam.deleteTrip(tripIndex)

    await server.emit("jam", jam.encode())


@server.register
async def setInitialPass(
    periodIndex: int, jamIndex: int, team: str, timestamp: datetime
) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
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

    await server.emit("jam", jam.encode())


@server.register
async def setLead(periodIndex: int, jamIndex: int, team: str, lead: bool) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
    teamJam: Jam.Team = jam[team]
    teamJam.lead = lead

    # Broadcast the updates
    await server.emit("jam", jam.encode())


@server.register
async def setLost(periodIndex: int, jamIndex: int, team: str, lost: bool) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
    teamJam: Jam.Team = jam[team]
    teamJam.lost = lost

    await server.emit("jam", jam.encode())


@server.register
async def setStarPass(
    periodIndex: int, jamIndex: int, team: str, tripIndex: None | int
) -> server.API:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.periods[periodIndex][jamIndex]
    teamJam: Jam.Team = jam[team]
    teamJam.starPass = tripIndex
    if tripIndex is not False:
        teamJam.lost = True

    await server.emit("jam", jam.encode())
