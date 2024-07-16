from datetime import datetime
from roller_derby.bout import series, Bout, Jam, Period, TEAMS, STOP_REASONS
from roller_derby.timeout import OFFICIAL
from server import API, URI
import server


@server.register
async def clockStoppage() -> API:
    bout: Bout = series.currentBout
    return bout.timeout.encode()


@server.register
async def callTimeout(timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.timeout.call(timestamp)

    period: Period = bout[-1]
    if period.isRunning():
        period.stop(timestamp)


@server.register
async def setTimeout(
    caller: TEAMS | OFFICIAL,
    isOfficialReview: bool,
    isRetained: bool,
    notes: str,
) -> API:
    bout: Bout = series.currentBout
    bout.timeout.assign(caller)
    if isOfficialReview:
        bout.timeout.convertToOfficialReview()
    else:
        bout.timeout.convertToTimeout()
    bout.timeout.resolve(isRetained, notes)


@server.register
async def endTimeout(timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.timeout.end(timestamp)


@server.register
async def bout(uri: URI) -> API:
    # TODO: query different bouts
    bout: Bout = series.currentBout
    return bout.encode()


@server.register
async def period(uri: URI) -> API:
    # if id is None:
    #     id = -1
    # elif id > 1:
    #     raise server.ClientException("a Bout may only have two Periods")

    bout: Bout = series.currentBout

    if uri.period == bout.getPeriodCount():
        # TODO: stop previous period and jam
        bout.addPeriod()
    elif uri.period > bout.getPeriodCount():
        raise server.ClientException("that Period does not exist")

    period: Period = bout[uri.period]
    return period.encode()


@server.register
async def jam(uri: URI) -> API:
    # Determine if a Jam should be added
    period: Period = series.currentBout[uri.period]
    if uri.jam == period.getJamCount():
        series.currentBout[-1].addJam()
    elif uri.jam > period.getJamCount():
        raise server.ClientException("This jam does not exist.")

    jam: Jam = period[uri.jam]

    return jam.encode()


@server.register
async def jamScore(uri: URI, team: None | TEAMS = None) -> API:
    period: Period = series.currentBout[uri.period]
    jam: Jam = period[uri.jam]
    if team is None:
        return {
            "home": jam.score.home.encode(),
            "away": jam.score.away.encode(),
        }
    else:
        return jam.score[team].encode()


@server.register
async def startJam(uri: URI, timestamp: datetime) -> API:
    # Start the Jam
    jam: Jam = series.currentBout[uri.period][uri.jam]
    jam.start(timestamp)


@server.register
async def stopJam(uri: URI, timestamp: datetime) -> API:
    jam: Jam = series.currentBout[uri.period][uri.jam]

    # Attempt to determine the reason the jam ended
    stopReason: None | STOP_REASONS = None
    if jam.getRemaining().total_seconds() <= 0:
        stopReason = "time"
    elif jam.score.home.getLead() or jam.score.away.getLead():
        stopReason = "called"

    jam.stop(timestamp)
    jam.stopReason = stopReason


@server.register
async def setJamStopReason(uri: URI, stopReason: STOP_REASONS) -> API:
    jam: Jam = series.currentBout[uri.period][uri.jam]
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
