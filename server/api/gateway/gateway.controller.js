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

var config = require('../../config/environment');

var _ = require('lodash');
var util = require('../../components/util');
var db = require('../../sqldb');

var Announcement = db.Announcement;

var Registration = db.Registration;

var Message = db.Message;

var DeviceStatistics = db.DeviceStatistics;
var Fact = db.Fact;
var auth = require('./auth.service');

var P = require('bluebird');

/*
 * Record data to the database
 */
exports.create = function(req, res) {
  var device = req.params.device;
  return announce(device)
    .then(() => {
      return P.each(req.body, function(object) {
        return checkDeviceData(object);
      }).then(() => {
        res.status(200).send();
      });
    })
    .catch(function(err) {
      console.trace(err);
      res.status(500).send();
    });
};

exports.ack = function(req, res) {
  console.log("(Acknowledging) registration information...");
  var device = req.params.device;
  Registration.findOne({
    where: {
      device: device
    }
  }).then(function(registration) {
    return registration.updateAttributes({
      registrationDate: new Date(),
      type:req.deviceType
    }).then(function(updated) {
      var obj = updated.get({
        plain: true
      });
      var token = auth.signToken(obj.device);
      res.format({
        text: function() {
          res.status(200).send(obj.device_group + '\r\n' + token);
        },
        json: function() {

          obj.token = token;
          res.status(200).json(obj);
        },
        default: function() {
          res.status(406).send('Not Acceptable');
        }
      });
    });
  }).catch(function(err) {
    console.trace('(Acknowledging) Error:', err);
    res.status(500).send('INTERNAL_ERROR');
  });
}

/*
 * Get time function
 */
exports.show = function(req, res) {
  var device = req.params.device;
  return announce(device)
    .then(() => {
      return getMessages(device)
        .then(respondShow(res))
        .then(clearMessages);
    })
    .catch(function(err) {
      console.trace(err);
      res.status(500).send();
    });
};

function respondShow(res) {
  return function(messages) {
    res.format({
      text: function() {
        var body = Date.now() + '\r\n';
        _.forEach(messages, (message) => {
          body += message.message + '\r\n';
        });
        res.status(200).send(body);
      },
      json: function() {
        res.status(200).send({
          dateTime: Date.now(),
          messages: messages
        });
      },
      default: function() {
        res.status(406).send('Not Acceptable');
      }
    });
    return messages;
  }

}

/**
 * Get Messages for device
 */
function getMessages(device) {
  console.log("Getting messages for device " + device + "...");
  return Message.findAll({
    where: {
      device: device,
      $or: [{
        delivery_type: 'TRANSIENT',
        readDate: null
      }, {
        delivery_type: 'PERSISTENT'
      }]
    }
  });


}

/**
 * Clears the received messages
 */
function clearMessages(messages) {
  var ids = _.map(messages, 'ID');
  return Message.update({
    readDate: new Date()
  }, {
    where: {
      ID: ids
    }
  });
}

/*
 * Pre insert tests
 */
function checkDeviceData(fact) {
  console.log("Checking data consistency...");
  // Discard data if it's zero (0)
  if (config.tests.zero) {
    console.log("Applying CHECK_ZERO_TEST...");
    if (fact.data === 0) {
      console.warn("TESTS_ZERO failed: group=%s device=%s sensor=%d data=%d", fact.device_group, fact.device, fact.sensor, fact.data);
      return;
    } else {
      console.log("TESTS_ZERO passed.");
    }
  } else {
    console.log("TESTS_ZERO skipped.");
  }

  // Discard data if it's beyound the number of configured sigmas (configuration in config.yml)
  if (config.tests.statistic) {
    console.log("Applying CHECK_STATISTIC_TEST...");
    return DeviceStatistics.findOne({
      where: {
        device: fact.device,
        sensor: fact.sensor
      }
    }).then(deviceStatistics => {
      if (deviceStatistics) {
        var deviation = deviceStatistics.deviation;
        // If fact.data deviates the number of sigmas, the data will be ignored
        if (fact.data > (config.statistics.sigmas * deviation)) {
          console.warn('Noise ignored: group=%s device=%s sensor=%d data=%d sigmas=%d deviation=%d', fact.group, fact.device, fact.sensor, fact.data, config.statistics.sigmas, deviation);
          return;
        } else {
          console.log("TESTS_STATISTIC passed.");
        }
      } else {
        console.log('Device Statistics not found: group=%s device=%s sensor=%d', fact.device_group, fact.device, fact.sensor);
        console.log("TESTS_STATISTIC skipped.");
      }
      return fact;
    }).then(saveFact);
  } else {
    console.log("TESTS_STATISTIC skipped.");
    return saveFact(fact);
  }
}

/**
 * Prepare data for insert
 */
function prepareData(fact) {
  var milis = fact.start + fact.delta;
  var dateTime = new Date(milis);
  return {
    'year': dateTime.getFullYear(),
    'month': dateTime.getMonth() + 1,
    'day': dateTime.getDate(),
    'week_day': dateTime.getDay() + 1,
    'hour': dateTime.getHours(),
    'minute': dateTime.getMinutes(),
    'second': dateTime.getSeconds(),
    'channel': fact.channel,
    'device_group': fact.device_group,
    'device': fact.device,
    'sensor': fact.sensor,
    'data': fact.data,
    'creationDate': (new Date())
  };
}

/**
 * Saves the fact to the database
 */
function saveFact(fact) {
  if (fact) {
    console.log("Persisting fact to the database...");
    return Fact.create(prepareData(fact));
  }
}


/**
 * This method announces the device to the Meccano Gateway
 * This is used for monitoring purposes
 */
function announce(device) {
  console.log("(Announcement) Announcing device " + device + " to the gateway...");
  return Announcement.findById(device).then(function(announcement) {
    if (announcement) {
      console.log("(Announcement) Device " + device + " already exists. Updating Announcement table");
      return announcement.updateAttributes({
        lastAnnouncementDate: new Date()
      });
    } else {
      console.log("(Announcement) Device " + device + " does not exists. Creating entry in Announcement table");
      return Announcement.create({
        'device': device
      });
    }
  }).catch(function(err) {
    console.error('(Announcement) Error announcing device ' + device, err);
  });
}
