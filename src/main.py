import server
from roller_derby.score import Jam
from roller_derby.timer import Timer
from datetime import datetime
from typing import Any


@server.register
async def getJamTimer() -> dict[str, Any]:
    timer: Timer = server.bouts.timer.jam
    return timer.encode()


@server.register
async def startJamTimer(timestamp: datetime) -> None:
    server.bouts.currentBout.currentJam.start(timestamp)
    timer: Timer = server.bouts.timer.jam
    timer.start(timestamp)

    # Broadcast the updates
    await server.emit("getJamTimer", timer.encode())


@server.register
async def stopJamTimer(stopReason: Jam.StopReason, timestamp: datetime) -> None:
    server.bouts.currentBout.currentJam.stop(stopReason, timestamp)
    timer: Timer = server.bouts.timer.jam
    timer.stop(timestamp)

    # Broadcast the updates
    await server.emit("getJamTimer", timer.encode())


if __name__ == "__main__":
    import scoreApi  # noqa: F401
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
    currentJam.start(datetime.now())

    asyncio.run(server.serve(port, debug=True))
