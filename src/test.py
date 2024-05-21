from roller_derby.bout import ClientException
import server

@server.register 
async def addTrip(sessionId: str, team: str, points: int, tick: int):
    currentJam = server.bouts.currentBout.currentJam
    if team == "home":
        currentJam.home.addTrip(points, tick)
    elif team == "away":
        currentJam.away.addTrip(points, tick)
    else:
        raise ClientException(f"Unknown team '{team}'.")

    await server.emit(
        "jamUpdate", currentJam.encode(), skipSession=sessionId, tick=tick
    )


@server.register
async def getCurrentJam(session):
    return server.bouts.currentBout.currentJam.encode()

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

