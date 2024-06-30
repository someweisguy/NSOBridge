from roller_derby.encodable import ClientException
import server
from server import API
from roller_derby.bout import Jam, Period
from datetime import datetime


@server.register
async def period(periodIndex: None | int = None) -> API:
    if periodIndex is None:
        periodIndex = -1

    period: Period = server.bouts.currentBout[periodIndex]
    return period.encode()


@server.register
async def jam(jamId: None | Jam.Id = None) -> API:
    # Get the current Jam index
    if jamId is None:
        jamId = server.bouts.currentBout[-1][-1].getId()

    # Determine if a Jam should be added
    period: Period = server.bouts.currentBout[jamId.period]
    if jamId.jam == len(period):
        server.bouts.currentBout[-1].addJam()
    elif jamId.jam > len(period):
        raise ClientException("This jam does not exist.")

    jam: Jam = period[jamId.jam]

    return jam.encode()


@server.register
async def jamScore(jamId: Jam.Id) -> API:
    period: Period = server.bouts.currentBout[jamId.period]
    jam: Jam = period[jamId.jam]
    return jam.score.encode()


# TODO: Move to separate timer control file?
@server.register
async def timer(timerType: str) -> API:
    match timerType:
        case "jam":
            # TODO
            return server.bouts.currentBout[-1][-1]._clock.encode()
        case "period":
            return server.bouts.currentBout[-1]._clock.encode()


@server.register
async def startJam(jamId: Jam.Id, timestamp: datetime) -> API:
    # Start the Jam
    jam: Jam = server.bouts.currentBout[jamId.period][jamId.jam]
    jam.start(timestamp)


@server.register
async def stopJam(jamId: Jam.Id, timestamp: datetime) -> API:
    jam: Jam = server.bouts.currentBout[jamId.period][jamId.jam]

    # Attempt to determine the reason the jam ended
    stopReason: Jam.STOP_REASONS = "unknown"
    if jam.finished():
        stopReason = "time"
    elif jam.score.home.getLead() or jam.score.away.getLead():
        stopReason = "called"

    jam.stop(timestamp, stopReason)


@server.register
async def setJamStopReason(jamId: Jam.Id, stopReason: Jam.STOP_REASONS) -> API:
    jam: Jam = server.bouts.currentBout[jamId.period][jamId.jam]
    jam.setStopReason(stopReason)


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
