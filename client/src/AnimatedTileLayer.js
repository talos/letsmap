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
            initialFrame: 0
        },

        initialize: function (url, numFrames, options) {
            L.TileLayer.prototype.initialize.call(this, url, options);
            if (numFrames) {
                this._numFrames = numFrames;
            } else {
                throw new Error("You must specify numFrames");
            }
            this._curFrame = this.options.initialFrame;
            var bufferCanvas = L.DomUtil.create('canvas', 'buffer');
            bufferCanvas.style.display = 'none';
            bufferCanvas.width = this.options.tileSize;
            bufferCanvas.height = this.options.tileSize;
            this._bufferCtx = bufferCanvas.getContext('2d');
            this._imageStore = L.DomUtil.create('div', 'imageStore');
        },

        drawTile: function (tile, tilePoint, zoom) {
            var url = this.getTileUrl(tilePoint, zoom),
                numFrames = this._numFrames,
                bufferCtx = this._bufferCtx,
                curFrame = this._curFrame,
                imageStore = this._imageStore,

                // called with 'this' as img
                compositeImage = function () {
                    var tileCtx = tile.getContext('2d'),
                        img = this,
                        contents,
                        data,
                        i,
                        len;

                    // draw the mask
                    // TODO vary based off of selected frame
                    if (img.height === 0 && img.width === 0) {
                        //blank
                        return;
                    } else {
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
                        tileCtx.clearRect(0, 0, tile.width, tile.height);
                        tileCtx.putImageData(contents, 0, 0);
                        tileCtx.globalCompositeOperation = 'source-in';
                        tileCtx.fillStyle = 'red';
                        tileCtx.fillRect(0, 0, tile.width, tile.height);

                        imageStore.removeChild(img);
                    }
                },
                img;

            img = L.DomUtil.create('img', 'animation_preload');
            imageStore.appendChild(img);
            img.crossOrigin = '';
            img.src = url;
            img.onload = compositeImage;
            img.onerror = function () {
                imageStore.removeChild(img);
            };
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
