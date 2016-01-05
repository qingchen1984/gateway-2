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

var config = require('../../config');
var mysql = require('mysql');
var util = require('util');

var pool = mysql.createPool(config.mysql);

/*
* Record data to the database
*/
exports.save = function(req, res) {
  console.log("POST");
  var sensorData = req.body;
  var lines = 0;
  console.log("Processing " + sensorData.length + " lines of data...");
  sensorData.forEach(function(object) {
    checkDeviceData(object);
    // Announce the device when the first line is processed
    if(lines == 0) {
      announce(object.device);
    } else {
      lines++;
    }
  })
  res.json({
    operation: 'POST',
    message: 'OK'
  });
};

/*
* Get time function
*/
exports.getTime = function(req, res) {
  console.log("Receiving data from device " + req.query.device);
  announce(req.query.device);
  res.send(Date.now() + '\n');
  res.end();
};

/*
* Pre insert tests
*/
function checkDeviceData(fact) {
  console.log("Checking data consistency...");
  // Discard data if it's zero (0)
  if(process.env.CHECK_ZERO_TEST) {
    console.log("Applying CHECK_ZERO_TEST...");
    if(fact.data == 0) {
      console.warn("CHECK_ZERO_TEST failed: group=%d device=%d sensor=%d data=%d", fact.group,fact.device,fact.sensor,fact.data);
      return;
    } else {
      console.log("CHECK_ZERO_TEST passed.");
    }
  } else {
    console.log("CHECK_ZERO_TEST skipped.");
  }

  // Discard data if it's beyound the number of configured sigmas (configuration in config.yml)
  if(process.env.CHECK_STATISTIC_TEST) {
    console.log("Applying CHECK_STATISTIC_TEST...");
    pool.query('select average, deviation from DeviceStatistics where device = ? and sensor = ?', [fact.device, fact.sensor],
      function(err, rows, fields) {
        if(err) console.error(err);
        if (rows && rows.length) {
          var deviation = rows[0].deviation;
          // If fact.data deviates the number of sigmas, the data will be ignored
          if (fact.data > (config.statistics.sigmas * deviation)) {
            console.warn('Noise ignored: group=%d device=%d sensor=%d data=%d sigmas=%d deviation=%d', fact.group,fact.device,fact.sensor,fact.data,config.statistics.sigmas,deviation);
            return;
          } else {
              console.log("CHECK_STATISTIC_TEST passed.");
              saveFact(fact);
          }
        } else {
          console.log('Device Statistics not found: group=%d device=%d sensor=%d',fact.group,fact.device,fact.sensor);
          console.log("CHECK_STATISTIC_TEST skipped.");
          saveFact(fact);
        }
      });
  } else {
    console.log("CHECK_STATISTIC_TEST skipped.");
    saveFact(fact);
  }
}

/**
* Prepare data for insert
*/
function prepareData(fact){
  var milis = fact.start + fact.delta;
  var dateTime = new Date(milis);
  return  {
    'year': dateTime.getFullYear(),
    'month': dateTime.getMonth() + 1,
    'day': dateTime.getDate(),
    'week_day': dateTime.getDay() + 1,
    'hour': dateTime.getHours(),
    'minute': dateTime.getMinutes(),
    'second': dateTime.getSeconds(),
    'fact': fact.fact,
    'device_group': fact.group,
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
  console.log("Persisting fact to the database...");
  var op = pool.query('insert into Facts set ?', prepareData(fact), function(errop, result) {
    if (errop) {
      console.error('Erro on save fact:',errop);
    } else {
      console.log("Data successfuly persisted to database...");
    }
  });
}

/**
* This method announces the device to the Meccano Gateway
* This is used for monitoring purposes
*/
function announce(device) {
  console.log("Announcing device " + device + " to the gateway...");
  // Create the announcement object
  var announcement = {
    'device' : device,
    'lastAnnouncementDate' : (new Date())
  };
  // Check if there is previous announcement data on the database
  var previous = pool.query( { sql: 'select count(*) as count from `Announcement` where `device` = ?',
                               values: [device]
                             }, function(error, results, fields) {
    // If announcement data does not exist, inserts to the table
    if(results[0].count == 0) {
      console.log("Device " + device + " does not existing. Creating entry in Announcement table");
      var op = pool.query('insert into `IOTDB`.`Announcement` set ?', announcement, function(errop, result) {
        if(errop) {
          console.error('(INSERT) Error announcing device ' + device);
          console.error(errop);
        }
      });
    // Updates the timestamp
    } else {
      console.log("Device " + device + " already exists. Updating Announcement table");
      var op = pool.query( { sql: 'update `IOTDB`.`Announcement` set `lastAnnouncementDate` = ? where `device` = ? ',
                             values : [ (new Date()), device ]
                           }, function(errop, result) {
        if(errop) {
          console.error('(UPDATE) Error announcing device ' + device);
          console.error(errop);
        }
      });
    }
  });
}
