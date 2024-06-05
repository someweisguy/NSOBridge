from roller_derby.score import ClientException, Bout, Jam
from datetime import datetime
from typing import Any
import server


@server.register
async def getJamTrips(team: str) -> dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    return {"team": team, "trips": [trip.encode() for trip in teamJam.trips]}


@server.register
async def setJamTrips(
    team: str, tripIndex: int, tripPoints: int, timestamp: datetime
) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    teamJam.setTrip(tripIndex, tripPoints, timestamp)
    await server.emit("getJamTrips", await getJamTrips(team))


@server.register
async def delJamTrips(team: str, tripIndex: int) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    teamJam.deleteTrip(tripIndex)
    await server.emit("getJamTrips", await getJamTrips(team))


@server.register
async def setJamInitial(team: str, timestamp: datetime) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Raise an error if trying to set an invalid initial trip
    if len(teamJam.trips):
        raise ClientException("This team has already had their initial trip.")

    # Assign lead and set the initial trip points
    try:
        teamJam.lead = True
    except ClientException:
        pass
    # Set the trip using timestamp calculated from the client latency
    points: int = 0  # TODO: if is overtime, set to 4 points
    teamJam.setTrip(0, points, timestamp)

    await server.emit("getJamTrips", await getJamTrips(team))
    await server.emit("getJamLead", await getJamLead(team))


@server.register
async def getJamLead(team: str) -> dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    return {"team": team, "lead": teamJam.lead}


@server.register
async def setJamLead(team: str, lead: bool) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]
    teamJam.lead = lead

    # Broadcast the updates
    await server.emit("getJamLead", await getJamLead(team))


@server.register
async def getJamLost(team: str) -> dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    return {"team": team, "lost": teamJam.lost}


@server.register
async def setJamLost(team: str, lost: bool) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]
    teamJam.lost = lost

    await server.emit("getJamLost", await getJamLost(team))


@server.register
async def getJamStarPass(team: str) -> dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    return {"team": team, "starPass": teamJam.starPass}


@server.register
async def setJamStarPass(team: str, tripIndex: None | int) -> None:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]
    teamJam.starPass = tripIndex
    teamJam.lost = True

    await server.emit("getJamStarPass", await getJamStarPass(team))
    await server.emit("getJamLost", await getJamLost(team))
