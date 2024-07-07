from server import API
from roller_derby.bout import series, Bout, Jam, Period
from datetime import datetime
import server


@server.register
async def gameClock(id: int) -> API:
    # TODO: query different bouts
    bout: Bout = series.currentBout
    return {
        "period": bout.getCurrentPeriod().encode(),
        "jam": bout.getCurrentPeriod().getCurrentJam().encode(),
        # TODO: current timeout, if any
    }


@server.register
async def bout(id: int) -> API:
    # TODO: query different bouts
    bout: Bout = series.currentBout
    return bout.encode()


@server.register
async def period(id: None | int = None) -> API:
    if id is None:
        id = -1
    elif id > 1:
        raise server.ClientException("a Bout may only have two Periods")

    bout: Bout = series.currentBout

    if id == len(bout):
        # TODO: stop previous period and jam
        bout.addPeriod()
    elif id > len(bout):
        raise server.ClientException("that Period does not exist")

    period: Period = series.currentBout[id]
    return period.encode()


@server.register
async def jam(id: None | Jam.Id = None) -> API:
    # Get the current Jam index
    if id is None:
        id = series.currentBout[-1][-1].getId()

    # Determine if a Jam should be added
    period: Period = series.currentBout[id.period]
    if id.jam == len(period):
        series.currentBout[-1].addJam()
    elif id.jam > len(period):
        raise server.ClientException("This jam does not exist.")

    jam: Jam = period[id.jam]

    return jam.encode()


@server.register
async def jamScore(id: Jam.Id, team: None | Jam.TEAMS = None) -> API:
    period: Period = series.currentBout[id.period]
    jam: Jam = period[id.jam]
    if team is None:
        return {
            "home": jam.score.home.encode(),
            "away": jam.score.away.encode(),
        }
    else:
        return jam.score[team].encode()


@server.register
async def startJam(id: Jam.Id, timestamp: datetime) -> API:
    # Start the Jam
    jam: Jam = series.currentBout[id.period][id.jam]
    jam.start(timestamp)


@server.register
async def stopJam(id: Jam.Id, timestamp: datetime) -> API:
    jam: Jam = series.currentBout[id.period][id.jam]

    # Attempt to determine the reason the jam ended
    stopReason: Jam.STOP_REASONS = "unknown"
    if jam.getRemaining().total_seconds() <= 0:
        stopReason = "time"
    elif jam.score.home.getLead() or jam.score.away.getLead():
        stopReason = "called"

    jam.stop(timestamp)
    jam.setStopReason(stopReason)


@server.register
async def setJamStopReason(id: Jam.Id, stopReason: Jam.STOP_REASONS) -> API:
    jam: Jam = series.currentBout[id.period][id.jam]
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
