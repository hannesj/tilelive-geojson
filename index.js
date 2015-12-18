"use strict"
const geojsonVt = require('geojson-vt');
const vtPbf = require('vt-pbf');
const url = require('url');
const fs = require('fs');

class GeoJSONSource {
  constructor(uri, callback){
    if (!uri.pathname) {
      callback(new Error('Invalid directory ' + url.format(uri)));
      return;
    }

    if (uri.hostname === '.' || uri.hostname == '..') {
      uri.pathname = uri.hostname + uri.pathname;
      delete uri.hostname;
      delete uri.host;
    }

    fs.readFile(uri.pathname, function (err, data){
      if (err){
        callback(err);
        return;
      }
      this.tileIndex = geojsonVt(JSON.parse(data), {maxZoom: 20}); //TODO: this should be configurable
      callback(null, this)
    }.bind(this));
  };

  getTile(z, x, y, callback){
    let tile = this.tileIndex.getTile(z, x, y)

    if (tile === null){
      tile = {features: []}
    }

    callback(null, vtPbf.fromGeojsonVt({ 'geojsonLayer': tile}), {"content-encoding": "none"})
  }

  getInfo(callback){
    callback(null, {
      format: "pbf"
    })
  }
}

module.exports = GeoJSONSource

module.exports.registerProtocols = (tilelive) => {
  tilelive.protocols['geojson:'] = GeoJSONSource
}
