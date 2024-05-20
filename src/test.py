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
    
    currentJam = server.bouts.currentBout.currentJam
    currentJam.start(server.getTick())
    
    asyncio.run(server.serve(8000, debug=True))

