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
        case _:
            raise ClientException("Unknown method.")
        
    # Broadcast the updates
    await server.emit("jamTrips", teamJam.encode())


@server.register
async def getJamLead(payload: dict[str, Any]) -> dict[str, Any]:
    # Get the desired Jam
    # TODO: get actual desired jam
    # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
    # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
    jam: Jam = server.bouts.currentBout.currentJam

    data: dict[str, Any] = payload["data"]

    # Get the desired team
    teamJam: Jam.Team = jam[data["team"]]

    response: dict[str, Any] = teamJam.encode()
    return response


@server.register
async def setJamLead(payload: dict[str, Any]) -> dict[str, Any]:
    # Get the desired Jam
    # TODO: get actual desired jam
    # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
    # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
    jam: Jam = server.bouts.currentBout.currentJam

    data: dict[str, Any] = payload["data"]

    # Get the desired team
    teamJam: Jam.Team = jam[data["team"]]

    # Set the team jam jammer stats
    teamJam.lead = data["lead"]
    teamJam.lost = data["lost"]
    teamJam.starPass = data["starPass"]

    response: dict[str, Any] = teamJam.encode()
    await server.emit("getJamTrip", response, skip=payload["sessionId"])
    return response


# @server.register
# async def getTeamJam(payload: dict[str, Any]) -> dict[str, Any]:
#     # Get the desired Jam
#     # TODO: get actual desired jam
#     # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
#     # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
#     jam: Jam = server.bouts.currentBout.currentJam

#     data: dict[str, Any] = payload["data"]
#     team: Literal["home", "away"] = data["team"]

#     # Get the desired team
#     teamJam: Jam.Team = jam[team]

#     response: dict[str, Any] = teamJam.encode()
#     return response

# @server.register
# async def setTeamJam(payload: dict[str, Any]) -> None:
#     # Get the desired Jam
#     # TODO: get actual desired jam
#     # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
#     # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
#     jam: Jam = server.bouts.currentBout.currentJam

#     data: dict[str, Any] = payload["data"]
#     team: Literal["home", "away"] = data["team"]

#     # Get the desired team
#     teamJam: Jam.Team = jam[team]
#     teamJam._trips = [Jam.Trip(**trip) for trip in data["trips"]]

#     response: dict[str, Any] = teamJam.encode()
#     await server.emit("getTeamJam", response, skip=payload["sessionId"], tick=payload["tick"])

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
