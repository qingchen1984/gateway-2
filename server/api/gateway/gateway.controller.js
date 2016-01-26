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
  var device = req.params.device;
  checkRegistration(device, function(registered) {
    if(registered) {
      var sensorData = req.body;
      var lines = 0;
      console.log("Processing " + sensorData.length + " lines of data...");
      sensorData.forEach(function(object) {
        checkDeviceData(object);
        // Announce the device when the first line is processed
        if(lines === 0) {
          announce(object.device);
        } else {
          lines++;
        }
      })
      res.json({
        operation: 'POST',
        status: 'OK'
      });
    } else {
      saveRegistration(device);
      res.status(403).json({
        operation: 'POST',
        status: 'NON_AUTHORIZED'
      });
    }
  });
};

/*
* Get time function
*/
exports.getMessages = function(req, res) {
  console.log("GET");
  var device = req.params.device;
  console.log("Checking if device is registered...");
  checkRegistration(device, function(registered) {
    if(registered) {
      console.log("Receiving data from device " + device);
      announce(device);
      // Get the messages for the device
      getMessages(device, function(error, results) {
        console.log(results);
        // The first message is aways the timestamp
        var messages = Date.now() + '\r\n';
        // Process other messages
        for(var m = 0; m<results.length; m++) {
          messages += results[m].message + '\r\n';
        }
        res.send(messages);
        res.end();
        clearMessages(results);
      })
    } else {
      saveRegistration(device);
      res.status(403).json({
        operation: 'GET',
        status: 'NON_AUTHORIZED'
      });
    }
  });
};

/**
* Get Messages for device
*/
function getMessages(device, fn) {
  console.log("Getting messages for device " + device + "...");
  var chk = pool.query({
    sql : 'select ID, message from `Messages` where `device` = ? and ( `delivery_type` = "TRANSIENT" and  readDate is null ) or (`delivery_type` = "PERSISTENT")',
    values : [device]
 }, function (error, results, fields) {
   fn(error, results);
 });
}

/**
* Clears the received messages
*/
function clearMessages(messages) {
  console.log("Clearing received messages...");
  for(var m = 0; m<messages.length; m++) {
    console.log("Clearing message ID " + messages[m].ID + "...");
    pool.query('update `Messages` set readDate = NOW() where ID = ?', messages[m].ID);
  }
}

/*
* Pre insert tests
*/
function checkDeviceData(fact) {
  console.log("Checking data consistency...");
  // Discard data if it's zero (0)
  if(process.env.TESTS_ZERO) {
    console.log("Applying CHECK_ZERO_TEST...");
    if(fact.data === 0) {
      console.warn("TESTS_ZERO failed: group=%d device=%d sensor=%d data=%d", fact.group,fact.device,fact.sensor,fact.data);
      return;
    } else {
      console.log("TESTS_ZERO passed.");
    }
  } else {
    console.log("TESTS_ZERO skipped.");
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
              console.log("TESTS_STATISTIC passed.");
              saveFact(fact);
          }
        } else {
          console.log('Device Statistics not found: group=%d device=%d sensor=%d',fact.group,fact.device,fact.sensor);
          console.log("TESTS_STATISTIC skipped.");
          saveFact(fact);
        }
      });
  } else {
    console.log("TESTS_STATISTIC skipped.");
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
* Saves the object to the database
*/
function saveRegistration(device) {
  console.log("Persisting registration information to the database...");
  var object = {
      "device": device
  };
  var op = pool.query('insert into Registration set ?', object, function(error, result) {
    if (error) {
      console.error('Error persisting object:', error);
    } else {
      console.log("Data successfuly persisted to database...");
    }
  });
}

/**
* Check if device is registered on Meccano IoT Gateway
**/
function checkRegistration(device, fn) {
  console.log("Checking registration of device " + device + "...");
  // Check if the device is registered on the gateway
  if(process.env.TESTS_AUTH) {
    var chk = pool.query({
        sql : 'select count(*) as registered from `Registration` where device = ? and device_group is not null',
        values : [device]
     }, function (error, results, fields) {
       console.log(results);
       console.log("existe: " + isNaN(results));
       fn( (!error && results[0] && results[0].registered === 1 ) );
     });
  // Else skip the test
  } else {
    console.log("TESTS_AUTH skipped.");
    fn(true);
  }
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
    if(results[0].count === 0) {
      console.log("Device " + device + " does not exists. Creating entry in Announcement table");
      var opq = pool.query('insert into `Announcement` set ?', announcement, function(errop, result) {
        if(errop) {
          console.error('(INSERT) Error announcing device ' + device);
          console.error(errop);
        }
      });
    // Updates the timestamp
    } else {
      console.log("Device " + device + " already exists. Updating Announcement table");
      var op = pool.query( { sql: 'update `Announcement` set `lastAnnouncementDate` = ? where `device` = ? ',
                             values : [ (new Date()), device ]
                           }, function(errop, result) {
        if(errop) {
          console.error('(UPDATE) Error announcing device ' + device);
          console.error(errop);
        }
      });
    }
  });
  // Inserts into Announcement_History
  var history = {
    'device': device,
    'announcementDate' : (new Date())
  };
  pool.query('insert into `Announcement_History` set ?', history, function(errop, result) {
    if(errop) {
      console.error('(INSERT) Error saving history of device ' + device);
      console.error(errop);
    }
  });
}
