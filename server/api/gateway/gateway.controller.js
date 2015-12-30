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

exports.save = function(req, res) {
  req.body.forEach(function(sensor) {
    processDeviceStatistics(sensor);
  })

  res.json({
    operation: 'POST',
    message: 'OK'
  });
};

exports.getTime = function(req, res) {
  res.send(Date.now() + '\n');
  res.end();
};

function processDeviceStatistics(fact) {
  pool.query('select average, deviation from DeviceStatistics where device = ? and sensor = ?', [fact.device, fact.sensor],
    function(err, rows, fields) {
      if(err) console.error(err);
      if (rows && rows.length) {
        var deviation = rows[0].deviation;
        if (fact.data > (config.statistics.sigmas * deviation)) {
          console.warn('Noise ignored: group=%d device=%d sensor=%d data=%d sigmas=%d deviation=%d', fact.group,fact.device,fact.sensor,fact.data,config.statistics.sigmas,deviation);
          return;
        }
      } else {
        console.warn('Device Statistics not found: group=%d device=%d sensor=%d',fact.group,fact.device,fact.sensor);
      }
      salveFact(fact);
    });
}

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

function salveFact(fact) {
  var op = pool.query('insert into Facts set ?', prepareData(fact), function(errop, result) {
    if (errop) {
      console.error('Erro on save fact:',errop);
    }
  });
}
