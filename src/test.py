from roller_derby.bout import Jam
from typing import Any
import server

@server.register
async def setJamTrip(sessionId: str, data: dict[str, Any]) -> dict[str, Any]: 
    # Get the desired Jam
    # TODO: get actual desired jam
    # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
    # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
    jam: Jam = server.bouts.currentBout.currentJam
    
    # Get the desired team
    teamJam: Jam.Team = jam[data["team"]]
    
    teamJam.setTrip(data["tripIndex"], data["tripPoints"], data["tick"])
    response: dict[str, Any] = teamJam.encode() | {"team": data["team"]}
    await server.emit("getJamTrip", response, skip=sessionId, tick=data["tick"])
    return response

@server.register
async def getJamTrip(sessionId: str, data: dict[str, Any]) -> dict[str, Any]:
    # Get the desired Jam
    # TODO: get actual desired jam
    # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
    # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
    jam: Jam = server.bouts.currentBout.currentJam
    
    # Get the desired team
    teamJam: Jam.Team = jam[data["team"]]
   
    response: dict[str, Any] = teamJam.encode() | {"team": data["team"]}
    return response
    
@server.register
async def deleteJamTrip(sessionId: str, data: dict[str, Any]) -> dict[str, Any]:
    # Get the desired Jam
    # TODO: get actual desired jam
    # periodIndex, jamIndex = data["periodIndex"], data["jamIndex"]
    # jam: Jam = server.bouts.currentBout[periodIndex][jamIndex]
    jam: Jam = server.bouts.currentBout.currentJam
    
    # Get the desired team
    teamJam: Jam.Team = jam[data["team"]]
    teamJam.deleteTrip(data["tripIndex"])
   
    response: dict[str, Any] = teamJam.encode() | {"team": data["team"]}
    await server.emit("getJamTrip", response, skip=sessionId, tick=data["tick"])
    return response

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
    currentJam.start(server.getTick())

    asyncio.run(server.serve(port, debug=True))
