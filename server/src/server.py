import psycopg2
import logging
from pyheat import HeatTile
import time

from heatlayer import TileMaster

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import Mongrel2Connection

from config import ( DATABASE_NAME, RECV_SPEC, SEND_SPEC )


tilemaster = TileMaster()

class TileHandler(WebMessageHandler):

    def get(self, year, zoom, tx, ty):
        try:
            year = int(year)
            zoom = int(zoom)
            tx = int(tx)
            ty = int(ty)
        except ValueError:
            self.set_status(400)
            return self.render()
        year = int(year)
        # 9: 32
        # 10: 64
        # 11: 128
        # 12: 256
        # 13: 512
        # 14: 1024?
        # 15: 2056+ (real)
        resolution = 64
        (min_y, max_y, min_x, max_x) = HeatTile(zoom, tx, ty).get_ll_bounds()
        cursor = self.db_conn.cursor()

        # TODO cache and draw from a larger queryset, we're gonna bombard our db
        before_query = time.time()
        cursor.execute('SELECT \
                           ST_Y(geometry), \
                           ST_X(geometry) \
                           FROM lowres \
                       WHERE resolution = %s AND year = %s AND \
                           ST_WITHIN(geometry, ST_MakeEnvelope(%s, %s, %s, %s, 4326))' %
                       ( resolution, year, min_x, min_y, max_x, max_y))
        after_query = time.time()
        logging.warn("Query execution time: %s" % (after_query - before_query))

        before_tile = time.time()
        tile_image = tilemaster.process(cursor, zoom, tx, ty)
        after_tile = time.time()
        logging.warn("Tile construction time: %s" % (after_tile - before_tile))

        self.headers['Content-Type'] = 'image/png'
        self.set_body(tile_image.getvalue())
        return self.render()

config = {
    'msg_conn': Mongrel2Connection(RECV_SPEC, SEND_SPEC),
    'handler_tuples': [
        #(r'^/points$', PointsHandler),
        (r'^/tile/(\d+)/(\d+)/([\d\.]+)/([\d\.]+)\.png?', TileHandler)
    ],
    'db_conn': psycopg2.connect(database=DATABASE_NAME)
}

app = Brubeck(**config)
app.run()
