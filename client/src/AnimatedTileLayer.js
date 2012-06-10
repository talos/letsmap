/*globals L*/
/*jslint nomen: true*/

"use strict";

(function () {

    /**
     * A tile layer that uses CSS sprites to make for smooth animations.
     */
    L.AnimatedTileLayer = L.TileLayer.extend({
        options: {
            async: false
        },

        _createTileProto: function () {
            var div = this._tileDiv = L.DomUtil.create('div', 'leaflet-tile'),
                tileSize = this.options.tileSize;
            div.style.width = tileSize + 'px';
            div.style.height = tileSize + 'px';
        },

        _createTile: function () {
            var tileDiv = this._tileDiv.cloneNode(false);
            tileDiv.onselectstart = tileDiv.onmousemove = L.Util.falseFn;
            return tileDiv;
        },

        _loadTile: function (tile, tilePoint, zoom) {
            // TODO this isn't good form, but it's how leaflet does it already!
            tile._layer = this;
            tile._url = this.getTileUrl(tilePoint, zoom);
            tile.style.backgroundImage = 'url(' + tile._url + ')';

            if (this.options.async) {
                throw new Error("Async animation not yet implemented.");
            } else {
                this.tileDrawn(tile);
            }
        },

        tileDrawn: function (tile) {
            this._tileOnLoad.call(tile);
        },

        /**
         * Call fn for each tile, with fn.call(layer, tile).
         *
         * @param {Function(tile)}
         */
        _eachTile: function (fn) {
            var i;
            for (i in this._tiles) {
                if (this._tiles.hasOwnProperty(i)) {
                    fn.call(this, this._tiles[i]);
                }
            }
        },

        /**
         * Change our view for all tiles to a particular frame.
         * This sets the background position to offset frameNumber * tileSize.
         *
         * @param {Number} frameNumber the frame to go to.
         */
        goToFrame: function (frameNumber) {
            this._eachTile(function (tile) {
                tile.style.backgroundPosition = (this.options.tileSize * frameNumber) + 'px 0px';
            });
        }
    });
}());
