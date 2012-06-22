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

/*jslint browser: true, nomen: true, vars: true*/
/*globals Backbone, $, LetsMap, Mustache, L, _*/
"use strict";

/**
 * @constructor
 * @param {Object} data
 * @extends {L.Marker}
 */
LetsMap.Marker = L.Marker.extend({

    options: {
        icon: new LetsMap.Icon(),
        clickable: false
    },

    template: $('#markerTemplate'),

    /**
     * @param {Object} data
     * @this {L.Marker}
     */
    initialize: function (data) {
        /*L.Util.setOptions(this, {
        });*/

        /** @type {Date} */
        this._minDate = LetsMap.Util.parseDate(data.range[0]);

        /** @type {Date} */
        this._maxDate = undefined;
        var dateNumber = data.range[1];
        if (dateNumber === -1) {
            var d = new Date();
            this._maxDate = LetsMap.Util.parseDate(
                String(d.getFullYear()) +
                    String('0' + d.getMonth()).slice(-2) +
                    String('0' + d.getDay()).slice(-2)
            );
        } else if (dateNumber === null) {
            // maxDate is null => single year
            this._maxDate = this._minDate;
        } else {
            this._maxDate = LetsMap.Util.parseDate(dateNumber);
        }

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
        /*this.bindPopup(Mustache.render(this.template.html(), data), {
            closeButton: false
        });*/
        this.popup = new L.Popup({
            closeButton: false,
            offset: new L.Point(0, 55)
        }, this);
        this.popup.setLatLng(this._latlng);
        this.popup.setContent(Mustache.render(this.template.html(), data));
    },

    /**
     * Override initIcon to show popup on rollover.
     */
    _initIcon: function () {
        var popup = this.popup,
            map = this._map;
        L.Marker.prototype._initIcon.call(this);
        $(this._icon).on('mouseenter', function () {
            map.openPopup(popup);
        });
        $(this._icon).on('mouseleave', function () {
            map.closePopup();
        });
        /*$(this._icon).on('click', function (e) {
            console.log(e);
        });*/
    },

    /**
     * Does this marker intersect with the passed dates?
     *
     * @param {Date} begin
     * @param {Date} end
     * @return {boolean}
     * @this {LetsMap.Marker}
     */
    isCurrent: function (begin, end) {
        // fail out if there's ambiguity
        if (this._minDate === null || this._maxDate === null) {
            return false;
        }

        /** @type {boolean} */
        // min date is in span
        if (this._minDate >= begin && this._minDate <= end) {
            return true;
        }
        // max date is in span
        if (this._maxDate >= begin && this._maxDate <= end) {
            return true;
        }
        // both exceed span
        if (this._minDate <= begin && this._maxDate >= end) {
            return true;
        }
        return false;
    }
});

