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
/*globals Backbone, $, LetsMap, Mustache, L, _*/
"use strict";

/**
 * @constructor
 * @param {Object} data
 * @extends {L.Marker}
 */
LetsMap.Marker = L.Marker.extend({

    template: $('#markerTemplate'),

    /**
     * @param {Object} data
     * @this {L.Marker}
     */
    initialize: function (data) {
        L.Util.setOptions(this, {
            icon: new LetsMap.Icon()
        });

        /** @type {Date} */
        this._minDate = LetsMap.Util.parseDate(data.range[0]);

        /** @type {Date} */
        this._maxDate = LetsMap.Util.parseDate(data.range[1]);

        /** @type {string} */
        this._title = data.title;

        /** @type {string} */
        this._address = data.address;

        /** @type {Array.<string>} */
        this._sources = data.sources;

        /** @type {string} */
        this._description = data.description;

        /** @type {L.LatLng} */
        this._latlng = new L.LatLng(data.lat, data.lng);

        /** @type {function(Date): boolean} */
        this.isCurrent = this.isCurrent || undefined;

        // bind a popup
        this.bindPopup(Mustache.render(this.template.html(), data), {
            closeButton: false
        });
    },

    /**
     * Is this marker contemporary with the passed date?
     * @param {Date} againstDate
     * @return {boolean}
     * @this {LetsMap.Marker}
     */
    isCurrent: function (againstDate) {
        // fail out if there's ambiguity
        if (this._minDate === null || this._maxDate === null) {
            return false;
        }
        /** @type {boolean} */
        var result = true;
        if (this._minDate) {
            result = result && this._minDate <= againstDate;
        }
        if (this._maxDate) {
            result = result && againstDate <= this._maxDate;
        }
        return result;
    }
});

