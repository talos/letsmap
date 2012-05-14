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

/*jslint browser: true*/
/*globals Backbone, $*/
"use strict";

/**
 * Global LetsMap reference.
 * @type {Object}
 */
var LetsMap = {};

LetsMap.Util = {};

/**
 * Turn a number a la 20061201 to the date 12/1/2006.  If passed null, returns
 * null.
 * @param {Number} num
 * @return {(Date|null)}
 */
LetsMap.Util.parseDate = function (num) {
    if (num === null) {
        return null;
    }
    var str = String(num),
        d = new Date(str.slice(0, 4), str.slice(4, 6), str.slice(6, 8));
    if (String(d) === 'Invalid Date') {
        throw num + " is not a date.";
    } else {
        return d;
    }
};

/**
 * The FPS we're aiming for
 * @define {number}
 */
var LETS_MAP_FPS = 100;

$(document).ready(function () {
    var v = new LetsMap.AppView({});
    v.$el.appendTo('body');
    v.render();
    //Backbone.history.start({ pushState: true });
});
