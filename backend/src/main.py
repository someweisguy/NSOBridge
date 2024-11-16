import logging
from derby import Series, Bout
import asyncio
import server


import api


if __name__ == '__main__':
    series: Series = Series()
    bout: Bout = series.add_bout()

    server.controller.log.setLevel(logging.DEBUG)
    server.controller.set_model(series)
    asyncio.run(server.serve())
