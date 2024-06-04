from roller_derby.score import ClientException, Bout, Jam
from datetime import datetime, timedelta
from typing import Any
import server


@server.register
async def jamTrips(
    method: str,
    team: str,
    now: datetime,
    latency: timedelta,
    tripIndex: None | int = None,
    tripPoints: None | int = None,
) -> None | dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Handle the method
    match method:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the trip using timestamp calculated from the client latency
            assert tripIndex is not None and tripPoints is not None
            timestamp: datetime = now - latency
            teamJam.setTrip(tripIndex, tripPoints, timestamp)
        case "del":
            # Delete the specified Jam trip
            assert tripIndex is not None
            teamJam.deleteTrip(tripIndex)
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamLead(
    method: str, team: str, lead: None | bool = None
) -> None | dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Handle the method
    match method:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam lead variable appropriately
            assert lead is not None
            teamJam.lead = lead
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamLost(
    method: str, team: str, lost: None | bool = None
) -> None | dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Handle the method
    match method:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam lost variable appropriately
            assert lost is not None
            teamJam.lost = lost
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamStarPass(
    method: str, team: str, tripIndex: None | int = None
) -> None | dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Handle the method
    match method:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam starPass variable appropriately
            assert tripIndex is not None
            teamJam.starPass = tripIndex
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamInitial(
    method: str, team: str, now: datetime, latency: timedelta
) -> None | dict[str, Any]:
    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[team]

    # Handle the method
    match method:
        case "set":
            if len(teamJam.trips):
                raise ClientException("This team has already had their initial trip.")
            try:
                teamJam.lead = True
            except ClientException:
                pass
            # Set the trip using timestamp calculated from the client latency
            timestamp: datetime = now - latency
            points: int = 0  # TODO: if is overtime, set to 4 points
            teamJam.setTrip(0, points, timestamp)
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())
