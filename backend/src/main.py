from datetime import datetime
from roller_derby import Series, Bout, Jam, BoutId, bouts
import asyncio
import server


@server.register
def getSeries() -> Series:
    return bouts


@server.register
def addBout() -> None:
    new_bout_id: BoutId = bouts.add()
    bout: Bout = bouts[new_bout_id]

    def default_clock_callback(_: datetime) -> None:
        server.queue_update((new_bout_id, ), bout)
        server.broadcast_updates()

    bout.clocks.set_callback(default_clock_callback)
    server.queue_update((new_bout_id,), bout)


@server.register
def deleteBout(boutId: BoutId) -> None:
    bouts.delete(boutId)
    server.queue_update((boutId,), None)


@server.register
def getBout(boutId: BoutId) -> Bout:
    return bouts[boutId]


@server.register
def getJam(boutId: BoutId, periodId: int, jamId: int) -> Jam:
    return bouts[boutId].jams[periodId][jamId]


if __name__ == '__main__':
    addBout()
    asyncio.run(server.serve())
