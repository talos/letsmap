# import threading, Queue
import math
import pyheat
import cStringIO as StringIO
import PIL

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
    def process(self, points_by_radius_frames, zoom, tx, ty):
        """
        points_by_radius_frames are the points in each frame that we want
        in the outpu image.
        """
        #radius = 1.5**zoom
        #alpha = 1.0 - (zoom / 20.0)
        alpha = 0.7

        # TODO this should be from elsewhere
        TILE_SIZE = 256

        img = PIL.Image.new('L', (len(points_by_radius_frames) * TILE_SIZE, TILE_SIZE))
        for i, points_by_radius in enumerate(points_by_radius_frames):
            tile = pyheat.HeatTile(zoom, tx, ty)
            for radius, points in points_by_radius.iteritems():
                # adjust radius based off of zoom
                # radius is good for zoom 13
                r = math.log(radius + 0.5, 1.1) * (1.5 ** (zoom - 13))

                tile.add_points(points, radius=r)
            tile.transform_color(alpha=alpha)
            img.paste(tile.get_pil_image(), (i * tile.width, 0))

        f = StringIO.StringIO()
        img.save(f, 'jpeg', quality=20)
        return f
