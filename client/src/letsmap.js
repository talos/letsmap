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
/*globals Backbone, $, LetsMap*/
"use strict";

/**
 * Global LetsMap reference.
 * @type {Object}
 */
var LetsMap = LetsMap || {};

$(document).ready(function () {
    var v = new LetsMap.AppView()
        .render()
        .$el
        .appendTo($('body'));
    //Backbone.history.start({ pushState: true });
});