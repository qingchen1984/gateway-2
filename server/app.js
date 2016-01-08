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

var express = require('express');

// Set the environment, location of the config file and load configuration
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.CONFIG_FILE = process.env.CONFIG_FILE ||  './config/config.yml';
var config  = require('./config');

// Load other configuration from environment or config file
process.env.CHECK_AUTH_TEST = process.env.CHECK_AUTH_TEST || config.check_tests.auth || true;
process.env.CHECK_STATISTIC_TEST = process.env.CHECK_STATISTIC_TEST ||  config.check_tests.statistics || true;
process.env.CHECK_ZERO_TEST = process.env.CHECK_ZERO_TEST ||  config.check_tests.zero || true;
process.env.TZ = process.env.TZ ||  config.timezone || 'Brazil/East';
process.env.MYSQL_HOST = process.env.MYSQL_HOST || config.mysql.host;
process.env.MYSQL_PORT = process.env.MYSQL_HOST || config.mysql.port;
process.env.MYSQL_USER = process.env.MYSQL_USER || config.mysql.user;
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || config.mysql.password;
process.env.MYSQL_DATABASE = process.env.MYSQL_DATABASE || config.mysql.database;
process.env.MYSQL_CONNECTIONLIMIT = process.env.MYSQL_CONNECTIONLIMIT || config.mysql.connectionLimit;
process.env.STATISTICS_SIGMAS = process.env.STATISTICS_SIGMAS || config.statistics.sigmas || 6;

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./express')(app);

require('./routes')(app);
// Start server
var PORT = process.env.PORT || config.port;
var HOSTNAME = process.env.HOSTNAME || config.hostname;
server.listen(PORT, HOSTNAME, function () {
  console.log('Meccano IoT Gateway listening on %d, in %s mode', config.port, app.get('env'));
});
