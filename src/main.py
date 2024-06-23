from roller_derby.encodable import ClientException
import server
from server import API
from roller_derby.score import Jam, JamIndex
from roller_derby.timer import Timer
from datetime import datetime


@server.register
async def jam(jamIndex: None | JamIndex = None) -> API:
    # Get the current Jam index
    if jamIndex is None:
        jamIndex = server.bouts.currentBout.currentJam.index()

    # Determine if a Jam should be added
    period: list[Jam] = server.bouts.currentBout[jamIndex.period]
    if jamIndex.jam == len(period):
        server.bouts.currentBout.addJam(jamIndex.period)
    elif jamIndex.jam > len(period):
        raise ClientException("This jam does not exist.")

    jam: Jam = period[jamIndex.jam]

    return jam.encode()


# TODO: Move to separate timer control file?
@server.register
async def timer(timerType: str) -> API:
    return server.bouts.currentBout.timer[timerType].encode()


@server.register
async def startJam(jamIndex: JamIndex, timestamp: datetime) -> API:
    # Start the Jam
    jam: Jam = server.bouts.currentBout.periods[jamIndex.period][jamIndex.jam]
    jam.start(timestamp)


@server.register
async def stopJam(jamIndex: JamIndex, timestamp: datetime) -> API:
    jam: Jam = server.bouts.currentBout.periods[jamIndex.period][jamIndex.jam]

    # Attempt to determine the reason the jam ended
    stopReason: Jam.STOP_REASONS = "unknown"
    jamTimer: Timer = server.bouts.currentBout.timer.jam
    millisecondsLeftInJam: None | int = jamTimer.getRemaining()
    assert millisecondsLeftInJam is not None
    if millisecondsLeftInJam < 0:
        stopReason = "time"
    elif jam.home.lead or jam.away.lead:
        stopReason = "called"

    jam.stop(timestamp, stopReason)


@server.register
async def setJamStopReason(jamIndex: JamIndex, stopReason: Jam.STOP_REASONS) -> API:
    jam: Jam = server.bouts.currentBout.periods[jamIndex.period][jamIndex.jam]
    jam.stopReason = stopReason


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
