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
/*globals Backbone, $, LetsMap, Mustache, _, L*/
"use strict";

LetsMap.AppRouter = Backbone.Router.extend({
    initialize: function (options) {
        this.view = options.view;

        // routes are assigned manually from an array in order to
        // ensure their ordering and use a regular expression.
        var routes = [
            ['', 'map'],
            ['about', 'about'],
            ['map/:year/:zoom/:lat/:lng', 'map']
        ];

        _.each(routes, _.bind(function (route) {
            this.route(route[0], route[1]);
        }, this));

        // LoD violation
        // whenever there's a click or movement on the map, bring us there.
        this.view.map.on('changeview click', function () {
            var view = this.view.map.getView();
            this.navigate('map/' + view.year + '/' + view.zoom + '/' + view.lat + '/' + view.lng, {
                trigger: true
            });
        }, this);
    },

    map: function (year, zoom, lat, lng) {
        this.view.about.$el.hide();
        if (year && zoom && lat && lng) {
            this.view.map.goTo(year, zoom, lat, lng);
        }
    },

    about: function () {
        this.view.about.$el.show();
    }
});
