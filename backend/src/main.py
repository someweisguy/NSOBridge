import logging
from derby import Series, Bout
import asyncio
import server

server.controller.log.setLevel(logging.DEBUG)

if __name__ == '__main__':
    server.controller.load_api()

    series: Series = Series()
    bout: Bout = series.add_bout()

    server.controller.set_model(series)
    asyncio.run(server.serve())
