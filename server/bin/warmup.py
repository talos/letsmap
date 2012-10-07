#!/usr/bin/env python

import sys
sys.path.append('src')

from heatlayer import generate_tile
from pyheat.heattile import HeatTile
import math
import os

MIN_LON = -74.111023
MAX_LON = -73.682556
MIN_LAT = 40.533633
MAX_LAT = 40.968493
TILE_SIZE = 256

SEP = os.path.sep
OUT_DIR = 'tile'

if not os.path.isdir(OUT_DIR):
    os.mkdir(OUT_DIR)

# utility
def x_from_zoom(zoom, lon):
    return HeatTile.CBK[zoom] + (lon * HeatTile.CEK[zoom])

def y_from_zoom(zoom, lat):
    inner = math.sin(lat * math.pi / 180)
    inner = min(max(inner, -0.9999), 0.9999)
    return HeatTile.CBK[zoom] + (0.5 * math.log((1 + inner) / (1 - inner)) * (-HeatTile.CFK[zoom]))


# Warm up the server by loading up all our tiles

# Work through the different zoom levels we allow
for zoom in xrange(12, 13):
    # Determine the x min tile, x max tile, y min tile, and y max tile
    X_MIN_TILE = int(x_from_zoom(zoom, MIN_LON) / TILE_SIZE)
    X_MAX_TILE = int(x_from_zoom(zoom, MAX_LON) / TILE_SIZE)
    Y_MIN_TILE = int(y_from_zoom(zoom, MAX_LAT) / TILE_SIZE)
    Y_MAX_TILE = int(y_from_zoom(zoom, MIN_LAT) / TILE_SIZE)

    for x in xrange(X_MIN_TILE, X_MAX_TILE + 1):
        for y in xrange(Y_MIN_TILE, Y_MAX_TILE + 1):
            jpeg = generate_tile(zoom, x, y)
            if jpeg is None:
                #print("Empty tile z%s x%s y%s" % (zoom, x, y))
                pass
            else:
                z_path = SEP.join([OUT_DIR, str(zoom)])
                y_path = SEP.join([OUT_DIR, str(zoom), str(y)])
                jpg_path = SEP.join([OUT_DIR, str(zoom), str(y), str(x) + '.jpg'])

                if not os.path.isdir(z_path):
                    os.mkdir(z_path)
                if not os.path.isdir(y_path):
                    os.mkdir(y_path)
                print("Saving tile z%s x%s y%s: %s" % (zoom, x, y, len(jpeg)))
                f = open(jpg_path, 'w')
                f.write(jpeg)
                f.close()

