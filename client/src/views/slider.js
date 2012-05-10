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

/*jslint nomen: true, browser: true*/
/*globals _, Backbone, $, LetsMap*/
"use strict";

/**
 * @enum
 */
var SLIDER_VIEW_DEFAULTS = {
    max: 2012,
    min: 1966
};

/**
 * @param {Object} options
 * @constructor
 * @extends Backbone.View
 */
LetsMap.SliderView = Backbone.View.extend({

    className: 'slider',

    events: {
        'mousedown .marker': 'startDrag'
    },

    /**
     * @param {Object} options
     * @this {LetsMap.SliderView}
     */
    initialize: function (options) {
        this.options = _.extend(SLIDER_VIEW_DEFAULTS, options);
        this.$el.html('<div class="marker"></div>');
    },

    /**
     * @this {LetsMap.SliderView}
     */
    render: function () {
        return this;
    },

    /**
     * @this {LetsMap.SliderView}
     */
    startDrag: function (evt) {
        this.endDrag();
        this.moveListener = window.addEventListener('mousemove', _.bind(this.drag, this));
        this.upListener = window.addEventListener('mouseup', _.bind(this.endDrag, this));
    },

    /**
     * @this {LetsMap.SliderView}
     */
    drag: _.debounce(function (evt) {
        window.console.log(evt);
    }, 100),

    /**
     * @this {LetsMap.SliderView}
     */
    endDrag: function (evt) {
        _.each([this.moveListener, this.upListener], function (l) {
            if (l) {
                window.removeEventListener(l);
            }
        });
    }
});
