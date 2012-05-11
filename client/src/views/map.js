/***
   * Copyright (c) 2012 John Krauss.
   *
   * This file is part of letsmap.
   *
   * letsmap is free software: you can redistribute it and/or modify
   * it under the terms of the GNU General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * letsmap is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   * GNU General Public License for more details.
   *
   * You should have received a copy of the GNU General Public License
   * along with letsmap.  If not, see <http://www.gnu.org/licenses/>.
   *
   ***/

/*jslint browser: true, nomen: true*/
/*globals Backbone, $, LetsMap, Mustache, MM*/
"use strict";

/** @define {string} */
var LETS_MAP_DEFAULT_BASE_LAYER = "toner";

/**
 * @param {Object} options
 * @constructor
 * @extends Backbone.View
 */
LetsMap.MapView = Backbone.View.extend({

    id: 'map',
    /**
     * @this {LetsMap.AppView}
     */
    initialize: function (options) {
        /** @type {string} */
        this.MAP_HOLDER_ID = 'map_holder';

        /** @type {MM.StamenTileLayer} */
        this.base = new MM.StamenTileLayer(LETS_MAP_DEFAULT_BASE_LAYER);

        /** @type {LetsMap.SliderView} */
        this.slider = new LetsMap.SliderView();
        this.slider.$el.appendTo(this.$el);
        this.slider.render();

        /** @type {jQueryObject} **/
        this.$mapHolder = $('<div />')
            .attr({'id': this.MAP_HOLDER_ID})
            .appendTo(this.$el);

        /** @type {MM.Map} */
        this._map = null;
    },

    /**
     * @this {LetsMap.AppView}
     */
    render: function () {
        if (!this._map) {
            this._map = new MM.Map(this.MAP_HOLDER_ID, this.base);
            this._map.setCenterZoom(new MM.Location(40.77, -73.98), 12);
        }

        return this;
    }
});
