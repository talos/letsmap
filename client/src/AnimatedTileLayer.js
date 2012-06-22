/*globals L*/
/*jslint nomen: true*/

"use strict";

(function () {

    /**
     * A tile layer that uses CSS sprites to make for smooth animations.
     */
    L.TileLayer.Animated = L.TileLayer.Canvas.extend({
        options: {
            async: false,
            initialFrame: 0,
            reuseTiles: true,
            delay: 0 // number of ms to wait before image load
                    // if set to 0, cooperates on render callbacks
        },

        initialize: function (url, numFrames, options) {
            L.TileLayer.prototype.initialize.call(this, url, options);
            if (numFrames) {
                this._numFrames = numFrames;
            } else {
                throw new Error("You must specify numFrames");
            }
            this._curFrame = this.options.initialFrame;

            // Our drawing buffer
            var bufferCanvas = L.DomUtil.create('canvas', 'buffer');
            bufferCanvas.style.display = 'none';
            bufferCanvas.width = this.options.tileSize;
            bufferCanvas.height = this.options.tileSize;
            this._bufferCtx = bufferCanvas.getContext('2d');

            // DOM container to temporarily hold images
            this._imageStore = L.DomUtil.create('div', 'imageStore');

            // Obj to keep track of onerror'd tiles, so we don't bombard server
            // with additional requests
            this._ignoreUrls = {};
        },

        drawTile: function (tile, tilePoint, zoom) {
            var url = this.getTileUrl(tilePoint, zoom),
                numFrames = this._numFrames,
                bufferCtx = this._bufferCtx,
                curFrame = this._curFrame,
                imageStore = this._imageStore,
                map = this._map,
                tileSize = this.options.tileSize,
                tileLowerRight = tile._leaflet_pos.add(new L.Point(tileSize, tileSize)),
                tileBounds = new L.LatLngBounds(map.layerPointToLatLng(tile._leaflet_pos),
                                                map.layerPointToLatLng(tileLowerRight)),
                ignoreUrls = this._ignoreUrls,
                layer = this,

                // check whether a tile is still in view
                isValid = function () {
                    return map.getBounds().intersects(tileBounds)
                        && zoom === map.getZoom()
                        && curFrame === layer._curFrame;
                },

                // called with 'this' as img
                compositeImage = function () {
                    if (isValid()) {
                        var tileCtx = tile.getContext('2d'),
                            img = this,
                            contents,
                            data,
                            i,
                            len;

                        // draw the mask
                        // TODO vary based off of selected frame
                        try {
                            if (img.height > 0 && img.width > 0) {
                                bufferCtx.drawImage(img, -tile.width * curFrame, 0,
                                                    tile.width * numFrames, tile.height);

                                contents = bufferCtx.getImageData(0, 0, tile.width, tile.height);
                                data = contents.data; // cachety cache
                                len = data.length;

                                // set the alpha channel from red
                                i = 0;
                                //var before = new Date();
                                while (i < len) {
                                    data[i + 3] = data[i];
                                    //data[i] = 255;
                                    i += 4;
                                }
                                tileCtx.putImageData(contents, 0, 0);
                                tileCtx.globalCompositeOperation = 'source-in';
                                tileCtx.fillStyle = 'red';
                                tileCtx.fillRect(0, 0, tile.width, tile.height);
                            } else {
                                tileCtx.clearRect(0, 0, tile.width, tile.height);
                            }
                        } finally {
                            imageStore.removeChild(img);
                        }
                    }
                },
                img;

            // Don't load images we know don't exist.
            if (!ignoreUrls.hasOwnProperty(url)) {
                setTimeout(function () {
                    // after delay, are we still in bounds and same zoom?
                    if (isValid()) {
                        img = L.DomUtil.create('img', 'animation_preload');
                        imageStore.appendChild(img);
                        img.crossOrigin = '';
                        img.src = url;
                        img.onload = compositeImage;
                        // clear out the tile if the image doesn't exist.
                        img.onerror = function () {
                            var tileCtx = tile.getContext('2d');
                            tileCtx.clearRect(0, 0, tile.width, tile.height);
                            imageStore.removeChild(img);
                            ignoreUrls[url] = true;
                        };
                    }
                }, this.options.delay);
            }
        },

        /**
         * Change our view for all tiles to a particular frame.
         *
         * @param {Number} frameNumber the frame to go to.
         */
        goToFrame: function (frameNumber) {
            this._curFrame = frameNumber;
            this.redraw();
        }
    });
}());
