import psycopg2
import logging
import redis

from heatlayer import generate_tile

from brubeck.request_handling import Brubeck, WebMessageHandler
from brubeck.connections import Mongrel2Connection

from config import ( DATABASE_NAME, RECV_SPEC, SEND_SPEC, REDIS_DB_PORT, REDIS_DB_HOST )

cache = redis.StrictRedis(REDIS_DB_HOST, port=REDIS_DB_PORT)
#cache.flushdb()

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
            payload = generate_tile(zoom, tx, ty)
            if payload is None:
                payload = '' # mark empty payloads in the cache

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
