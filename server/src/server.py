import psycopg2
import logging
import ujson
import time
import cStringIO as StringIO
import gzip

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import Mongrel2Connection

from config import ( DATABASE_NAME, RECV_SPEC, SEND_SPEC, MIN_X, MIN_Y,
                    RANGE_X, RANGE_Y )


class PointsHandler(WebMessageHandler):

    def get(self):
        try:
            resolution = int(self.get_argument('resolution', ''))
            min_x = float(self.get_argument('min_x', ''))
            max_x = float(self.get_argument('max_x', ''))
            min_y = float(self.get_argument('min_y', ''))
            max_y = float(self.get_argument('max_y', ''))
            year = int(self.get_argument('year', ''))
            cursor = self.db_conn.cursor()
        except ValueError:
            return self.render(status_code=400)

        before_query = time.time()
        cursor.execute('SELECT \
                           ROUND((((ST_X(geometry) - %s) / %s) * %s)), \
                           ROUND((((ST_Y(geometry) - %s) / %s) * %s)), \
                           n FROM lowres \
                       WHERE resolution = %s AND year = %s AND \
                           ST_WITHIN(geometry, ST_MakeEnvelope(%s, %s, %s, %s, 4326))' %
                      (MIN_X, RANGE_X, resolution,
                       MIN_Y, RANGE_Y, resolution,
                       resolution, year, min_x, min_y, max_x, max_y))
        after_query = time.time()
        logging.warn("Query execution time: %s" % (after_query - before_query))

        # ujson is much, much faster than doing manual IO, even with cStringIO
        before_out = time.time()
        obj = []
        for row in cursor:
            obj.append([int(row[0]), int(row[1]), row[2]])
        out = ujson.dumps(obj)
        after_out = time.time()
        logging.warn("Output construction time: %s" % (after_out - before_out))

        # Surprisingly, it's markedly faster to build the output into a
        # separate buffer, then put it in the zipfile in another step
        before_zip = time.time()
        zbuf = StringIO.StringIO()

        # This amount of gzip compression is nearly free, but still provides
        # 4:1 compression with our data
        zfile = gzip.GzipFile(None, 'wb', 1, zbuf)
        # JSON-P
        zfile.write('d(')
        zfile.write(out)
        zfile.write(');')
        zfile.close()
        after_zip = time.time()
        logging.warn("GZip time: %s" % (after_zip - before_zip))

        self.headers['content-encoding'] = 'gzip'
        self.headers['content-type'] = 'application/javascript,text/javascript; charset=UTF-8'

        self.set_body(zbuf.getvalue())
        return self.render()

config = {
    'msg_conn': Mongrel2Connection(RECV_SPEC, SEND_SPEC),
    'handler_tuples': [
        (r'^/points$', PointsHandler)
    ],
    'db_conn': psycopg2.connect(database=DATABASE_NAME)
}

app = Brubeck(**config)
app.run()
