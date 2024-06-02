from roller_derby.bout import ClientException, Bout, Jam
from typing import Any
import server


@server.register
async def jamTrips(payload: dict[str, Any]) -> None | dict[str, Any]:
    NOW: int = server.getTimestamp()
    kwargs: dict[str, Any] = payload["kwargs"]

    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[kwargs["team"]]

    # Handle the method
    match payload["method"]:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the trip using timestamp calculated from the client latency
            timestamp: int = NOW - payload["latency"]
            teamJam.setTrip(kwargs["tripIndex"], kwargs["tripPoints"], timestamp)
        case "del":
            # Delete the specified Jam trip
            teamJam.deleteTrip(kwargs["tripIndex"])
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamLead(payload: dict[str, Any]) -> None | dict[str, Any]:
    kwargs: dict[str, Any] = payload["kwargs"]

    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[kwargs["team"]]

    # Handle the method
    match payload["method"]:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam lead variable appropriately
            teamJam.lead = kwargs["lead"]
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def jamLost(payload: dict[str, Any]) -> None | dict[str, Any]:
    kwargs: dict[str, Any] = payload["kwargs"]

    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[kwargs["team"]]

    # Handle the method
    match payload["method"]:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam lost variable appropriately
            teamJam.lost = kwargs["lost"]
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())
        
@server.register
async def jamStarPass(payload: dict[str, Any]) -> None | dict[str, Any]:
    kwargs: dict[str, Any] = payload["kwargs"]

    # Get the desired Bout
    bout: Bout = server.bouts.currentBout

    # Get the desired Jam and Jam Team
    jam: Jam = bout.currentJam  # TODO: periodIndex, jamIndex
    teamJam: Jam.Team = jam[kwargs["team"]]

    # Handle the method
    match payload["method"]:
        case "get":
            # Just ack with the Jam Team
            return teamJam.encode()
        case "set":
            # Set the Jam starPass variable appropriately
            teamJam.starPass = kwargs["tripIndex"]
        case _ as default:
            raise ClientException(f"Unknown method '{default}'.")

    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


if __name__ == "__main__":
    import asyncio
    import socket

    port: int = 8000
    serverAddress: str = "0.0.0.0"
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0)
        sock.connect(("1.1.1.1", 1))  # Doesn't actually send network data
        serverAddress = sock.getsockname()[0]
    httpStr: str = f"http://{serverAddress}:{port}"
    server.log.info(f"Starting server at '{httpStr}'.")

    currentJam = server.bouts.currentBout.currentJam
    currentJam.start(server.getTimestamp())

    asyncio.run(server.serve(port, debug=True))
