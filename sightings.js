const rp = require('request-promise');
const _ = require('lodash');
var Promise = require('bluebird');


module.exports.get = (event, context, callback) => {
  console.log('the event', event);

  var options = {
    uri: 'https://api.artdatabanken.se/observations-hfs/v2/sightings',
    qs: {
      dateFrom: '2018-01-13',
      dateTo: '2018-04-13',
      eastingCoordinate: event.longitude,
      northingCoordinate: event.latitude,
      coordinateSystemId: '10',
      radiusOfSearch: event.radiusOfSearch,
      limit: '50',
      sortField: 'site'
    },
    headers: {
      'User-Agent': 'Request-Promise',
      'Ocp-Apim-Subscription-Key': '13abfcf0213040f1957bcb654f4ea20d'
    },
    json: true
  };

  let entry = {};

  console.log('about to send req');
  rp(options)
    .then(function(res) {
      return res.data.map(a => {
        var reducedCoords = _.reduce(a.site.coordinates, function(res, c) {
          if (c.coordinateSystemId === 10) {
            res = { longitude: c.easting, latitude: c.northing };
          }
          return res;
        });

        entry = {
          taxonId: a.taxonId,
          name: a.commonName,
          position: reducedCoords,
          date: a.startDate,
          quantity: a.quantity
        }
        return entry;
      })
    })
    .then(res => {
      return speciesLookup(res);
    })
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(res),
      })
    })
    .catch(function(err) {
      console.log('oops', err);
    });
};

const speciesLookup = (arr) => {

  return Promise.map(arr, function(item) {
    console.log('hello, here is the tax id ', item);
    var options = {
      uri: 'https://api.artdatabanken.se/observations-hfs/v2/taxa/' + item.taxonId,
      headers: {
        'User-Agent': 'Request-Promise',
        'Ocp-Apim-Subscription-Key': '13abfcf0213040f1957bcb654f4ea20d'
      },
      json: true
    };
    return rp(options)
      .then(data => {
        console.log(data.speciesGroupId);
        switch (data.speciesGroupId) {
          case 1:
            item.category = 'Kärlväxter';
            break;
          case 2:
            item.category = 'Mossor';
            break;
          case 3:
            item.category = 'Svampar';
            break;
          case 4:
            item.category = 'Kärlväxter';
            break;
          case 5:
            item.category = 'Alger';
            break;
          case 7:
            item.category = 'Ryggradslösa djur';
            break;
          case 8:
            item.category = 'Fåglar';
            break;
          case 9:
            item.category = 'Grod - och kräldjur';
            break;
          case 11:
            item.category = 'Andra däggdjur';
            break;
          case 12:
            item.category = 'Fladdermöss';
            break;
          case 14:
            item.category = 'Fiskar';
            break;
        }
        return item;
      })
  }).then(function(results) {
    return results;
  })



};
