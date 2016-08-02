'use strict';
var config = require('../../config/environment');
var db = require('../../sqldb');
var jwt = require('jsonwebtoken');

var Registration = db.Registration;

const userAgentRe = /Meccano-IoT ?\((.*)\)/;


function getToken(req) {

  var token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.query && req.query.hasOwnProperty('access_token')) {
    token = req.query.access_token;
  }
  return jwt.verify(token, config.secrets.session);

}

var validateDevice = function(req, res, next) {
  var device = req.device;
  if (!device) {
    console.error('INVALID_DEVICE')
    return res.status(500).send('INVALID_DEVICE');
  }
  var agentStr = req.get('User-Agent');
  var versionStr = req.get('Version');

  if(userAgentRe.test(agentStr)){
    var array = agentStr.match(userAgentRe);
    req.deviceType = array[1];
    req.deviceVersion = versionStr;
  }else{
    return res.status(406).send();
  }

  return Registration.findOrCreate({
    where: {
      device: device,
    },
    defaults: {
      'device': device,
      'version': req.deviceVersion,
      'type':req.deviceType
    }
  }).spread((entity) => {
    if (entity.device_group) {
      return next();
    } else {
      return res.status(401).send('NON_AUTHORIZED');
    }
  }).catch(function(err) {
    console.trace(err);
    return res.status(500).send();
  });
}

function isAuthenticated(req, res, next) {
  try {
    var token = getToken(req);
    req.device = token.device;
    return validateDevice(req, res, next);
  } catch (err) {
    return res.status(403).send('INVALID_TOKEN');
  }
}

function isAuthorized(req, res, next) {
  req.device = req.params.device || req.query.device;
  return validateDevice(req, res, next);
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(device) {
  return jwt.sign({
    device: device
  }, config.secrets.session, {
    expiresIn: config.secrets.sessionTime
  });
}

exports.signToken = signToken;
exports.isAuthorized = isAuthorized;
exports.isAuthenticated = isAuthenticated;
