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
* Submit registration
*/
exports.post = function(req, res) {
  console.log("POST");
  var registrationData = req.body;
  saveRegistration(registrationData);
  res.json({
    operation: 'POST',
    message: 'WAITING_ACKNOWLEDGEMENT'
  });
};

/*
* Get registration information
*/
exports.get = function(req, res) {
  console.log("GET");
  var device = req.query.device;
  getRegistration(device, res);
};

/*
* Acknowledge registration
*/
exports.put = function(req, res) {
  console.log("PUT");
  var registrationData = req.body;
  acknowledgeRegistration(registrationData, res);
};

/*
* Unregister device
*/
exports.delete = function(req, res) {
  console.log("DELETE");
  var device = req.query.device;
  deleteRegistration(device, res)
};

/**
* Saves the object to the database
*/
function saveRegistration(object) {
  console.log("Persisting registration information to the database...");
  var op = pool.query('insert into Registration set ?', object, function(errop, result) {
    if (errop) {
      console.error('Error persisting object:', errop);
    } else {
      console.log("Data successfuly persisted to database...");
    }
  });
}

/**
* Get the object to the database
*/
function getRegistration(device, res) {
  console.log("Get registration information from the database...");
  var op = pool.query('select * from `Registration` where `device` = ?', device, function(error, result, fields) {
    if (error) {
      res.json({
        'operation' : 'GET',
        'message' : 'INTERNAL_ERROR',
        'cause' : error
      });
      return;
    }
    if (result.length == 0) {
      // Unknown device
      res.json({
        'operation': 'GET',
        'device' : 'UNKNOWN',
        'device_group' :  'UNKNOWN',
        'status' : 'UNKNOWN_DEVICE'
      });
    } else {
      var r = result[0];
      // Check is device is registered
      if(r.registrationDate != null) {
        res.json({
          'operation' : 'GET',
          'device_group' : r.device,
          'group' : r.device_group,
          'submissionDate': r.creationDate,
          'registrationDate' : r.registrationDate,
          'status' : 'REGISTERED'
        });
      } else {
        res.json({
          'operation' : 'GET',
          'device' : r.device,
          'device_group' : r.group,
          'submissionDate' : r.creationDate,
          'status' : 'WAITING_ACKNOWLEDGEMENT'
        });
      }
    }
  });
}

/**
* Unregister Device
*/
function deleteRegistration(device, res) {
  console.log("Unregistering device...");
  var op = pool.query('delete from Registration where `device` = ?', device, function(error, result, fields) {
    if (error) {
      res.json({
        'operation' : 'GET',
        'message' : 'INTERNAL_ERROR',
        'cause' : error
      });
    } else {
      // Unknown device
      res.json({
        'operation': 'DELETE',
        'device' : device,
        'status' : 'UNREGISTERED'
      });
    }
  });
}


/**
* Acknowledge registration
*/
function acknowledgeRegistration(object, res) {
  console.log("Acknowledging registration information...");
  var qu = pool.query( "select * from Registration where `device` = ?", object.device, function(errorq, results, fields) {
    if(!errorq && results.length == 1) {
      console.log(results);
      var op = pool.query( { sql : 'update `Registration` set `registrationDate` = ? where `device` = ? ',
                             values : [(new Date), object.device] },
                             function(error, result) {
        if (error) {
          console.error('Error updating object:', error);
          res.send("INTERNAL_ERROR");
        } else {
          console.log("Data successfuly updated to database...");
          res.send(results[0].device_group);
        }
      });
    } else {
      res.json("UNKNOWN_DEVICE");
    }
  });

}
