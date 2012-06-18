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

/*jslint sub: true, nomen: true, browser: true, maxlen: 79, vars: true*/
/*globals _, Backbone, $, LetsMap, LETS_MAP_FPS*/
"use strict";

/**
 * @constant {Object}
 */
var SLIDER_VIEW_DEFAULTS = {
    max: 2008,
    min: 1966,

    // whether to round to whole values.
    quantize: true
};

/**
 * A slider view that emits 'drag' and 'endDrag' events with the current value
 * as the argument.
 * @param {Object} options
 * @constructor
 * @extends Backbone.View
 */
LetsMap.SliderView = Backbone.View.extend({

    className: 'slider',

    /**
     * @override
     * @param {Object} options
     * @this {LetsMap.SliderView}
     */
    initialize: function (options) {
        /** @type {Object} **/
        this.options = _.extend(SLIDER_VIEW_DEFAULTS, options);

        /** @type {jQueryObject} */
        this.$marker = $('<div />').addClass('marker');
        this.$el.append(this.$marker);

        /** @type {jQueryObject} */
        this.$blips = $('<div />').addClass('blips');
        this.$el.append(this.$blips);

        /** @type {function(jQuery.event)} */
        this.startDrag = _.myBind(this.startDrag, this);

        /** @type {function(jQuery.event)} */
        this.drag = _.myBind(this.drag, this);

        /** @type {function(jQuery.event)} */
        this.endDrag = _.myBind(this.endDrag, this);

        /* Backbone can't have this property munged by closure. */
        this['events'] = {
            'mousedown .marker': this.startDrag
        };

        $(window).mouseup(this.endDrag);

        /** @type {function(): number} */
        this.getValue = this.getValue || undefined;

        // keep the marker's text in line with current value
        this.on('drag', this.render, this);

        /** @type {function(): number} */
        this.initialLeftOffset = this.initialLeftOffset || undefined;

        /** @type {number} */
        this._initialLeftOffset = null;

        /** @type {function(number, number)} */
        this.addBlip = this.addBlip || undefined;
    },

    /**
     * @this {LetsMap.SliderView}
     */
    initialLeftOffset: function () {
        if (this._initialLeftOffset === null) {
            this._initialLeftOffset = this.$marker.position().left;
        }
        return this._initialLeftOffset;
    },

    /**
     * Uses relative percentages to resize properly.
     *
     * @this {LetsMap.SliderView}
     */
    addBlip: function (startValue, endValue) {
        /*if (endValue === null) {
            // single point
            endValue = startValue;
        }
        var range = this.options.max - this.options.min,
            leftPerc = (startValue - this.options.min) / range * 100,
            rightPerc = (endValue - this.options.min) / range * 100;
        $('<div />')
            .addClass('blip')
            .css({
                left: leftPerc + '%',
                width: (rightPerc - leftPerc) + '%'
            }).appendTo(this.$blips);

        */
    },

    /**
     * @override
     * @this {LetsMap.SliderView}
     */
    render: function () {
        this.$marker.text(this.getValue());
        return this;
    },

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    startDrag: function (evt) {
        $(window).bind('mousemove', this.drag);
        return false;
    },

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    drag: _.debounce(function (evt) {

        /** @type {number} **/
        var x = (evt.pageX - this.initialLeftOffset()) -
            this.$el.offset().left;

        /** @type {number} **/
        var width = this.$el.outerWidth();

        /** @type {number} **/
        var markerWidth = this.$marker.outerWidth();

        width = width - markerWidth;

        /** @type {number} **/
        var range = this.options.max - this.options.min;

        /** @type {number} **/
        var ratio = range / width;

        /** @type {number} **/
        var val;

        x = x < 0 ? 0 : x;
        x = x > width ? width : x;

        if (this.options.quantize) {
            x = Math.round(x * ratio) / ratio;
        }

        this.$marker.css({
            left: (x + this.initialLeftOffset()) + 'px'
        });

        this.trigger('drag', this.getValue());
        return false;
    }, 1000 / LETS_MAP_FPS),

    /**
     * @param {jQuery.event} evt
     * @this {LetsMap.SliderView}
     */
    endDrag: function (evt) {
        this.trigger('endDrag', this.getValue());
        $(window).unbind('mousemove', this.drag);
        return false;
    },

    /**
     * @return {number} The current numeric value of slider.
     * @this {LetsMap.SliderView}
     */
    getValue: function () {
        /** @type {number} **/
        var width = this.$el.outerWidth() - this.$marker.outerWidth();

        /** @type {number} **/
        var range = this.options.max - this.options.min;

        /** @type {number} **/
        var ratio = range / width;

        /** @type {number} **/
        var left = this.$marker.position().left - this.initialLeftOffset();

        /** @type {number} **/
        var val = this.options.min + (left * ratio);

        return this.options.quantize ? Math.round(val) : val;
    },

    /**
     * Set the value of the slider.
     * @param {number} n The value to set it to.
     * @this {LetsMap.SliderView}
     */
    setValue: function (n) {
        n = this.options.min > n ? this.options.min : n;
        n = this.options.max < n ? this.options.max : n;
        var width = this.$el.outerWidth() - this.$marker.outerWidth();
        var range = this.options.max - this.options.min;
        var x = width * ((n - this.options.min) / range);

        this.$marker.css({
            left: x + 'px'
        });
        this.trigger('endDrag', this.getValue());
        /*, {
            complete: _.bind(function () {
                this.trigger('endDrag', this.getValue());
            }, this)
        });*/
    }
});
