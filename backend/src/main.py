from datetime import datetime
from roller_derby.bout import series, Bout, Jam, TEAMS, STOP_REASONS
from roller_derby.timeout import OFFICIAL
from server import API, URI
import server


@server.register
async def startIntermission(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.startIntermission(timestamp)


@server.register
async def stopIntermission(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.stopIntermission(timestamp)


@server.register
async def beginPeriod(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.beginPeriod(timestamp)


@server.register
async def endPeriod(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.endPeriod(timestamp)


@server.register(name='series')
async def getBouts() -> API:
    return [bout.encode() for bout in series._bouts]


@server.register
async def callTimeout(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.timeout.call(timestamp)


@server.register
async def endTimeout(uri: URI, timestamp: datetime) -> API:
    bout: Bout = series.currentBout
    bout.timeout.end(timestamp)


@server.register
async def assignTimeout(uri: URI, team: TEAMS | OFFICIAL) -> API:
    bout: Bout = series.currentBout
    bout.timeout.assign(team)


@server.register
async def setTimeoutIsOfficialReview(uri: URI, isOfficialReview: bool) -> API:
    bout: Bout = series.currentBout
    bout.timeout.setIsOfficialReview(isOfficialReview)


@server.register
async def setTimeoutIsRetained(uri: URI, isRetained: bool) -> API:
    bout: Bout = series.currentBout
    bout.timeout.setIsRetained(isRetained)


@server.register
async def setTimeoutNotes(uri: URI, notes: str) -> API:
    bout: Bout = series.currentBout
    bout.timeout.setNotes(notes)


@server.register
async def bout(uri: URI) -> API:
    # TODO: query different bouts
    bout: Bout = series.currentBout
    return bout.encode()


@server.register
async def jam(uri: URI) -> API:
    jam: Jam = series.currentBout.jams[uri.period][uri.jam]
    return jam.encode()


@server.register
async def startJam(uri: URI, timestamp: datetime) -> API:
    # Start the Jam
    jam: Jam = series.currentBout.jams[uri.period][uri.jam]
    jam.start(timestamp)


@server.register
async def stopJam(uri: URI, timestamp: datetime) -> API:
    jam: Jam = series.currentBout.jams[uri.period][uri.jam]
    jam.stop(timestamp)


@server.register
async def setJamStopReason(uri: URI, stopReason: STOP_REASONS) -> API:
    jam: Jam = series.currentBout.jams[uri.period][uri.jam]
    jam.stopReason = stopReason


if __name__ == '__main__':
    import scoreApi  # noqa: F401
    import asyncio
    import socket

    port: int = 8000
    serverAddress: str = '0.0.0.0'
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(0)
        sock.connect(('1.1.1.1', 1))  # Doesn't actually send network data
        serverAddress = sock.getsockname()[0]
    httpStr: str = f'http://{serverAddress}:{port}'
    server.log.info(f'Starting server at \'{httpStr}\'.')

    asyncio.run(server.serve(port, debug=True))
