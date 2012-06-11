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

/*jslint browser: true, nomen: true, sub: true, vars: true*/
/*globals Backbone, $, LetsMap, Mustache, L, _, HeatCanvas*/
"use strict";

/**
 * Default base layer.
 * @define {string}
 */
var LETS_MAP_BASE_LAYER_DEFAULT = 'toner';

/*
var tempData = [{
    "address": "315 Bowery New York, NY 10003",
    "lat": "40.72518590",
    "lng": "-73.99213060",
    "range": [19731200, 20061015],
    "title": "CBGB"
}, {
    "address": "1941 Broadway, New York, NY",
    "lat": "40.77372690",
    "lng": "-73.98267240",
    "range": [19660911, null],
    "title": "Lincoln Center's Alice Tully Hall opens"
}, {
    "address": "67-01 110th Street, Forest Hills, New York",
    "lat": "40.72947220",
    "lng": "-73.8456710",
    "range": [19740000, 19740000],
    "title": "Formation of Ramones",
    "description": "They met in high school in Forest Hills"
}, {
    "address": "673 Broadway New York, NY 10012",
    "lat": "40.72750920",
    "lng": "-73.99503009999999",
    "range": [19700000, 19730803],
    "title": "Mercer Arts Center, Early Punk Shows",
    "description": "Building collapsed in 1973",
    "sources": ["http://en.wikipedia.org/wiki/Mercer_Arts_Center"]
}];
*/

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
        this.MAP_HOLDER_ID = 'mapHolder';

        /** @type {L.StamenTileLayer} */
        this.base = new L.StamenTileLayer(LETS_MAP_BASE_LAYER_DEFAULT);

        /** @type {L.StamenTileLayer} */
        this.heatLayer = new L.TileLayer.Animated(
            'http://localhost:7001/tile/{z}/{x}/{y}',
            2009 - 1966
        );

        /** @type {LetsMap.SliderView} */
        this.slider = new LetsMap.SliderView();
        this.slider.$el.appendTo(this.$el);
        this.slider.render();
        this.slider.on('drag', _.myBind(this.render, this));
        this.slider.on('endDrag', _.myBind(this.render, this));

        /** @type {jQueryObject} **/
        this.$mapHolder = $('<div />')
            .attr({'id': this.MAP_HOLDER_ID})
            .appendTo(this.$el);

        /** @type {?L.Map} **/
        this._map = null;

        /** @type {Array.<LetsMap.Marker>} */
        this.markers = [];

        /** @type {function()} */
        this.loadMarkers = this.loadMarkers || undefined;
        this.loadMarkers();

        /** @type {Object} */
        this.mortgages = {};
    },

    /**
     * Load markers via XHR.
     *
     * @this {LetsMap.AppView}
     */
    loadMarkers: function () {
        $.when(
            $.getJSON('../../research/locations.json'),
            $.getJSON('../../research/output.json')
        ).done(_.bind(function (locationsArgs, pointsArgs) {
            var locations = locationsArgs[0],
                geocoded = pointsArgs[0];
            this.markers = _.map(locations, function (l) {
                // extract lon/lat from points
                var g = geocoded[l['address']],
                    latLng;
                if ($.isArray(g)) {
                    latLng = g[1];
                    if ($.isArray(latLng)) {
                        l['lat'] = latLng[0];
                        l['lng'] = latLng[1];
                    }
                }
                // TODO handling missing lat/lng
                if (!l['lat'] || !l['lng']) {
                    l['lat'] = -1;
                    l['lng'] = -1;
                }
                return new LetsMap.Marker(l);
            });
            this.render();
        }, this));
    },

    /**
     * @this {LetsMap.AppView}
     */
    changeHeatLayer: function (curYear) {
        if (this.curYear !== curYear) {
            if (this.curYear) {
                // TODO: shuffle CSS
                this.heatLayer.goToFrame(curYear - 1966);
            }
            this.curYear = curYear;
        }
    },

    /**
     * @this {LetsMap.AppView}
     */
    render: function () {
        // initial setup
        if (!this._map) {
            this._map = new L.Map(this.MAP_HOLDER_ID, {
                center: new L.LatLng(40.77, -73.98),
                zoom: 12
            });
            this._map.addLayer(this.base);
            this._map.addLayer(this.heatLayer);
        }
        var curDate = new Date(this.slider.getValue(), 1, 1),
            curYear = curDate.getFullYear();

        this.changeHeatLayer(curYear);

        _.each(this.markers, _.myBind(function (marker) {
            if (marker.isCurrent(curDate)) {
                this._map.addLayer(marker);
            } else {
                this._map.removeLayer(marker);
            }
        }, this));

        return this;
    }
});
