# import threading, Queue
import math
import pyheat
import cStringIO as StringIO
import PIL
import time
import logging
import psycopg2
from pyheat import HeatTile

from config import ( MIN_YEAR, MAX_YEAR, PALETTE_PATH, DATABASE_NAME )

db_conn = psycopg2.connect(database=DATABASE_NAME)

def generate_tile(zoom, tx, ty):
    """
    Generate JPEG frames for specified zoom, x, and y.
    """
    resolution = 2 ** (zoom - 4)
    resolution = 2048 if resolution > 1024 else resolution
    (min_y, max_y, min_x, max_x) = HeatTile(zoom, tx, ty, PALETTE_PATH).get_ll_bounds(
        padding=50)
        #padding=5 * (3 ** (zoom - 13)))
    cursor = db_conn.cursor()

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
        return None

    else:
        for p in cursor:
            (x, y, n, year) = p
            if not n in points_by_radius_years[year]:
                points_by_radius_years[year][n] = []
            points_by_radius_years[year][n].append((x, y))

        # tilemaster takes an array of data points, not the object
        # TODO: actually order this correctly
        #tile_image = tilemaster.process(points_by_radius_years.values(), zoom, tx, ty)
        #radius = 1.5**zoom
        #alpha = 1.0 - (zoom / 20.0)

        points_by_radius_frames = points_by_radius_years.values()
        alpha = 0.7

        # TODO this should be from elsewhere
        TILE_SIZE = 256

        img = PIL.Image.new('L', (len(points_by_radius_frames) * TILE_SIZE, TILE_SIZE))
        for i, points_by_radius in enumerate(points_by_radius_frames):
            tile = pyheat.HeatTile(zoom, tx, ty)
            for radius, points in points_by_radius.iteritems():
                # adjust radius based off of zoom
                # natural radius is good for zoom 13
                r = math.log(radius + 0.5, 1.2) * (1.5 ** (zoom - 12)) * 0.83

                tile.add_points(points, radius=r)
            tile.transform_color(alpha=alpha)
            img.paste(tile.get_pil_image(), (i * tile.width, 0))

        tile_image = StringIO.StringIO()
        img.save(tile_image, 'jpeg', quality=20)
        after_tile = time.time()
        logging.warn("Tile construction time: %s" % (after_tile - before_tile))

        return tile_image.getvalue()
