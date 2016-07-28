/*
* Meccano IOT Gateway
*
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*/

'use strict';
var semver = require('semver');
var db = require('../../sqldb');
var Release = db.Release;
var util = require('../../components/util');

exports.show = function(req, res) {
  return Release.findAll({
      where: {
        type: req.params.type,
        prerelease: null
      },
      order: 'major DESC , minor DESC , patch DESC , prerelease DESC'
    })
    .then(util.respondWithResult(res))
    .catch(util.handleError(res));
};

exports.update = function(req, res) {
  console.log(JSON.stringify(req.headers));
  var type = req.params.type;
  if (type === 'ESP8266') {
    return updateESP(req, res);
  } else {
    res.status(406).send('Not supported');
  }
};


function checkVersion(currentVersion, type) {
  currentVersion = semver.parse(currentVersion);
  if (currentVersion) {
    return Release.findOne({
      where: {
        type: type,
        prerelease: null
      },
      order: 'major DESC , minor DESC , patch DESC'
    }).then((latest) => {
      if (latest && semver.gt(latest.version, currentVersion)) {
        return latest;
      } else {
        return;
      }
    });
  } else {
    throw 'INVALID_VERSION';
  }
}




function updateESP(req, res) {
  if (validateHeaders(req)) {
    var version = semver.parse(req.get('X-ESP8266-VERSION'));
    return checkVersion(version, req.params.type)
      .then((latest) => {
        if (latest) {
          res.status(200).send(latest.firmwareBlob);
        } else {
          res.status(304).send();
        }
      })
      .catch(util.handleError(res));

  } else {
    res.status(403).send();
  }
}



function validateHeaders(req) {
  if (req.get('USER-AGENT') === 'ESP8266-http-Update') {
    return (req.get('X-ESP8266-STA-MAC') &&
      req.get('X-ESP8266-AP-MAC') &&
      req.get('X-ESP8266-FREE-SPACE') &&
      req.get('X-ESP8266-SKETCH-SIZE') &&
      req.get('X-ESP8266-CHIP-SIZE') &&
      req.get('X-ESP8266-SDK-VERSION'));
  } else {
    return false;
  }

}
