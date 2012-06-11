import psycopg2
import logging
import time
import redis

from pyheat import HeatTile
from heatlayer import TileMaster

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import Mongrel2Connection

from config import ( DATABASE_NAME, RECV_SPEC, SEND_SPEC, MIN_YEAR, MAX_YEAR, PALETTE_PATH )

tilemaster = TileMaster()
cache = redis.StrictRedis('localhost')
cache.flushdb()

class TileHandler(WebMessageHandler):

    def get(self, zoom, tx, ty):
        try:
            zoom = int(zoom)
            tx = int(tx)
            ty = int(ty)
        except ValueError:
            self.set_status(400)
            return self.render()

        # short-circuit return from cache
        cache_key = self.message.path
        payload = cache.get(cache_key)
        if payload is None:
            # 9: 
            # 10:
            # 11: 
            # 12: 8
            # 13: 
            # 14: 
            # 15: 
            resolution = 2 ** (zoom - 6)
            resolution = 2056 if resolution > 1024 else resolution
            (min_y, max_y, min_x, max_x) = HeatTile(zoom, tx, ty, PALETTE_PATH).get_ll_bounds(
                padding=3)
                #padding=5 * (3 ** (zoom - 13)))
            cursor = self.db_conn.cursor()

            # TODO cache and draw from a larger queryset, we're gonna bombard our db
            before_query = time.time()
            cursor.execute('SELECT \
                               ST_Y(geometry), \
                               ST_X(geometry), \
                               n, \
                               year \
                               FROM lowres \
                           WHERE year BETWEEN %s AND %s AND resolution = %s AND \
                               ST_WITHIN(geometry, ST_MakeEnvelope(%s, %s, %s, %s, 4326))' %
                           ( MIN_YEAR, MAX_YEAR, resolution, min_x, min_y, max_x, max_y))
            after_query = time.time()
            logging.warn("Query execution time: %s" % (after_query - before_query))

            before_tile = time.time()

            # create object keyed by year
            points_by_radius_years = {}
            for y in xrange(MIN_YEAR, MAX_YEAR + 1):
                points_by_radius_years[y] = {}

            # no need to render anything
            if cursor.rowcount == 0:
                payload = ''

            else:
                for p in cursor:
                    (x, y, n, year) = p
                    if not n in points_by_radius_years[year]:
                        points_by_radius_years[year][n] = []
                    points_by_radius_years[year][n].append((x, y))

                # tilemaster takes an array of data points, not the object
                # TODO: actually order this correctly
                tile_image = tilemaster.process(points_by_radius_years.values(), zoom, tx, ty)
                after_tile = time.time()
                logging.warn("Tile construction time: %s" % (after_tile - before_tile))

                payload = tile_image.getvalue()

            cache.set(cache_key, payload)

        if len(payload) == 0:
            logging.warn('empty payload')
            self.set_status(204)
        else:
            self.headers['Content-Type'] = 'image/jpeg'
            self.set_body(payload)

        self.headers['Access-Control-Allow-Origin'] = '*'
        return self.render()

config = {
    'msg_conn': Mongrel2Connection(RECV_SPEC, SEND_SPEC),
    'handler_tuples': [
        #(r'^/points$', PointsHandler),
        (r'^/tile/(\d+)/([\d\.]+)/([\d\.]+)$', TileHandler)
    ],
    'db_conn': psycopg2.connect(database=DATABASE_NAME)
}

app = Brubeck(**config)
app.run()
