import server
from server import API
from roller_derby.score import Jam
from roller_derby.timer import Timer
from datetime import datetime

@server.register
async def jam() -> API:
    return server.bouts.currentBout.currentJam.encode()


@server.register
async def timer(timerType: str) -> API:
    return server.bouts.timer[timerType].encode()


@server.register
async def startJam(timestamp: datetime) -> API:
    jam: Jam = server.bouts.currentBout.currentJam
    jam.start(timestamp)

    jamTimer: Timer = server.bouts.timer.jam
    jamTimer.start(timestamp)

    # Start the period clock if it isn't running
    periodClock: Timer = server.bouts.timer.game
    if not periodClock.isRunning():
        periodClock.start(timestamp)
        await server.emit("timer", periodClock.encode())

    # Broadcast the updates
    await server.emit("jam", jam.encode())
    await server.emit("timer", jamTimer.encode())


@server.register
async def stopJam(timestamp: datetime) -> API:
    jam: Jam = server.bouts.currentBout.currentJam
    jam.stop(timestamp)

    timer: Timer = server.bouts.timer.jam
    timer.stop(timestamp)
    
    # Attempt to determine the reason the jam ended
    millisecondsLeftInJam: None | int = timer.getRemaining()
    assert millisecondsLeftInJam is not None
    if millisecondsLeftInJam < 0:
        jam.stopReason = "time"
    elif jam.home.lead or jam.away.lead:
        jam.stopReason = "called"

    # Broadcast the updates
    await server.emit("jam", jam.encode())
    await server.emit("timer", timer.encode())


@server.register
async def setJamStopReason(stopReason: Jam.STOP_REASONS) -> API:
    jam: Jam = server.bouts.currentBout.currentJam
    jam.stopReason = stopReason

    await server.emit("jam", jam.encode())


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

    asyncio.run(server.serve(port, debug=True))
