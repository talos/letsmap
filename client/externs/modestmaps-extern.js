/**
 * Externs for modestmaps
 * @see https://github.com/stamen/modestmaps-js
 * @externs
 */

"use strict";

var MM = { };

/**
 * @constructor
 * @param {number} lon
 * @param {number} lat
 */
MM.Location = function (lon, lat) {};

/**
 * @constructor
 * @param {string} name
 */
MM.StamenTileLayer = function (name) {};

/**
 * @constructor
 * @param {string} id
 * @param {MM.StamenTileLayer} layer
 */
MM.Map = function (id, layer) {};

/**
 * @param {MM.Location} location
 * @param {number} zoom
 */
MM.Map.prototype.setCenterZoom = function (location, zoom) {};

