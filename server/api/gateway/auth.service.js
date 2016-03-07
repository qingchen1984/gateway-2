'use strict';
var config = require('../../config/environment');
var db = require('../../sqldb');
var Registration = db.Registration;


function isAuthorized(req, res, next) {
  var device = req.params.device || req.query.device;
  if (!device) {
    return res.status(500).send('INVALID_DEVICE');
  }

  return Registration.findOrCreate({
    where: {
      device: device,
    },
    defaults: {
      'device': device
    }
  }).spread((entity)=> {
    if (entity.device_group) {
      return next();
    } else {
      return res.status(403).send('NON_AUTHORIZED');
    }
  }).catch(function(err) {
    console.trace(err);
    return res.status(500).send();
  });
}

exports.isAuthorized = isAuthorized;
