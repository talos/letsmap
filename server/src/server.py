import psycopg2
import logging
from pyheat import HeatTile
#import ujson
import time
#import cStringIO as StringIO
#import gzip

from heatlayer import TileMaster

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import Mongrel2Connection

from config import ( DATABASE_NAME, RECV_SPEC, SEND_SPEC )

# class PointsHandler(WebMessageHandler):
# 
#     def get(self):
#         try:
#             resolution = int(self.get_argument('resolution', ''))
#             min_x = float(self.get_argument('min_x', ''))
#             max_x = float(self.get_argument('max_x', ''))
#             min_y = float(self.get_argument('min_y', ''))
#             max_y = float(self.get_argument('max_y', ''))
#             year = int(self.get_argument('year', ''))
#             cursor = self.db_conn.cursor()
#         except ValueError:
#             return self.render(status_code=400)
# 
#         before_query = time.time()
#         cursor.execute('SELECT \
#                            ROUND((((ST_X(geometry) - %s) / %s) * %s)), \
#                            ROUND((((ST_Y(geometry) - %s) / %s) * %s)), \
#                            n FROM lowres \
#                        WHERE resolution = %s AND year = %s AND \
#                            ST_WITHIN(geometry, ST_MakeEnvelope(%s, %s, %s, %s, 4326))' %
#                       (MIN_X, RANGE_X, resolution,
#                        MIN_Y, RANGE_Y, resolution,
#                        resolution, year, min_x, min_y, max_x, max_y))
#         after_query = time.time()
#         logging.warn("Query execution time: %s" % (after_query - before_query))
# 
#         # ujson is much, much faster than doing manual IO, even with cStringIO
#         before_out = time.time()
#         obj = []
#         for row in cursor:
#             obj.append([int(row[0]), int(row[1]), row[2]])
#         out = ujson.dumps(obj)
#         after_out = time.time()
#         logging.warn("Output construction time: %s" % (after_out - before_out))
# 
#         # Surprisingly, it's markedly faster to build the output into a
#         # separate buffer, then put it in the zipfile in another step
#         before_zip = time.time()
#         zbuf = StringIO.StringIO()
# 
#         # This amount of gzip compression is nearly free, but still provides
#         # 4:1 compression with our data
#         zfile = gzip.GzipFile(None, 'wb', 1, zbuf)
#         # JSON-P
#         zfile.write('d(')
#         zfile.write(out)
#         zfile.write(');')
#         zfile.close()
#         after_zip = time.time()
#         logging.warn("GZip time: %s" % (after_zip - before_zip))
# 
#         self.headers['content-encoding'] = 'gzip'
#         self.headers['content-type'] = 'application/javascript,text/javascript; charset=UTF-8'
# 
#         self.set_body(zbuf.getvalue())
#         return self.render()


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
        resolution = 2056
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
        self.headers['X-Feature-Number'] = str(cursor.rowcount)
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
