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

/*jslint nomen: true, browser: true, maxlen: 79*/
/*globals _, Backbone, $, LetsMap, LETS_MAP_FPS*/
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
        /** @type {Object} **/
        this.options = _.extend(SLIDER_VIEW_DEFAULTS, options);

        /** @type {jQueryObject} */
        this.$marker = $('<div />').addClass('marker');
        this.$el.append(this.$marker);
        _.bindAll(this, 'drag', 'endDrag');
        $(window).mouseup(this.endDrag);

        /** @type {function(jQuery.event)} */
        this.drag = this.drag || undefined;

        /** @type {function(jQuery.event)} */
        this.endDrag = this.endDrag || undefined;

        /** @type {function(): number} */
        this.getValue = this.getValue || undefined;
    },

    /**
     * @this {LetsMap.SliderView}
     */
    render: function () {
        return this;
    },

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    startDrag: function (evt) {
        $(window).bind('mousemove', this.drag);
    },

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    drag: _.debounce(function (evt) {
        var x = evt.pageX - this.$el.offset().left,
            width = this.$el.width();
        x = x < 0 ? 0 : x;
        x = x > width ? width : x;
        this.$marker.css({
            left: x + 'px'
        });
    }, 1000 / LETS_MAP_FPS),

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    endDrag: function (evt) {
        $(window).unbind('mousemove', this.drag);
    },

    /**
     * @returns {number} The current numeric value of slider.
     * @this {LetsMap.SliderView}
     */
    getValue: function () {
        var width = this.$el.width(),
            range = this.options.max - this.options.min,
            ratio = range / width;

        return this.options.min + (this.$marker.offsetParent() * ratio);
    }
});
