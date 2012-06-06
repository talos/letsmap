# import threading, Queue
import pyheat

# Simple batch job processor
# class Batcher(threading.Thread):
#     def __init__(self, init_fn=None, task_fn=None):
#         super(Batcher, self).__init__()
#         self.inputs = Queue.Queue()
#         self.outputs = Queue.Queue()
# 
#         if init_fn is not None:
#             self.do_init = init_fn
# 
#         if task_fn is not None:
#             self.do_task = task_fn
# 
#         self.start()
# 
#     def run(self):
#         self.do_init()
#         while True:
#             (args, kwargs) = self.inputs.get(True, None)
#             self.outputs.put(self.do_task(*args, **kwargs))
# 
#     def do_init(self, *args, **kwargs):
#         pass
# 
#     def do_task(self, *args, **kwargs):
#         raise NotImplemented
# 
#     def process(self, *args, **kwargs):
#         self.inputs.put((args, kwargs))
#         return self.outputs.get(True, None)


class TileMaster():
    def process(self, tile_points, zoom, tx, ty):
        #radius = 1.5**zoom
        radius = 10
        alpha = 1.0 - (zoom / 20.0)

        tile = pyheat.HeatTile(zoom, tx, ty)
        (lat_min, lat_max, lon_min, lon_max) = tile.get_ll_bounds(padding=radius+1)
        # tile_points = [point for point in points if point[0] > lat_min and
        #                                             point[0] < lat_max and
        #                                             point[1] > lon_min and
        #                                             point[1] < lon_max]

        tile.add_points(tile_points, radius=radius)
        tile.transform_color(alpha=alpha)
        return tile.get_image()
