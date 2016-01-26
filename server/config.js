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
var yamlConfig = require('node-yaml-config');

// Try loading the configuration file, if exists
var conf = yamlConfig.load(process.env.CONFIG_FILE, process.env.NODE_ENV);

// Load other configuration from environment or config file
process.env.PORT = process.env.PORT || conf.port;
process.env.ADDRESS = process.env.ADDRESS || conf.address;
process.env.TESTS_AUTH = process.env.TESTS_AUTH || conf.tests.auth || true;
process.env.TESTS_STATISTIC = process.env.TESTS_STATISTIC ||  conf.tests.statistics || true;
process.env.TESTS_ZERO = process.env.TESTS_ZERO ||  conf.tests.zero || true;
process.env.TZ = process.env.TZ ||  conf.timezone || 'Brazil/East';
process.env.MYSQL_HOST = process.env.MYSQL_HOST || conf.mysql.host;
process.env.MYSQL_PORT = process.env.MYSQL_PORT || conf.mysql.port;
process.env.MYSQL_USER = process.env.MYSQL_USER || conf.mysql.user;
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || conf.mysql.password;
process.env.MYSQL_DATABASE = process.env.MYSQL_DATABASE || conf.mysql.database;
process.env.MYSQL_CONNECTIONLIMIT = process.env.MYSQL_CONNECTIONLIMIT || conf.mysql.connectionLimit;
process.env.STATISTICS_SIGMAS = process.env.STATISTICS_SIGMAS || conf.statistics.sigmas || 6;

console.log();
console.log("===================================================================");
console.log("*** Meccano IoT Gateway Configuration ")
console.log("NODE_ENV: " + process.env.NODE_ENV);
console.log("CONFIG_FILE: " + process.env.CONFIG_FILE);
console.log("PORT: " + process.env.PORT);
console.log("ADDRESS: " + process.env.ADDRESS);
console.log("TZ: " + process.env.TZ);
console.log("===");
console.log("TESTS_AUTH: " + process.env.TESTS_AUTH);
console.log("TESTS_STATISTIC: " + process.env.TESTS_STATISTIC);
console.log("TESTS_ZERO: " + process.env.TESTS_ZERO);
console.log("===");
console.log("MYSQL_HOST: " + process.env.MYSQL_HOST);
console.log("MYSQL_PORT: " + process.env.MYSQL_PORT);
console.log("MYSQL_USER: " + process.env.MYSQL_USER);
console.log("MYSQL_PASSWORD: *****");
console.log("MYSQL_DATABASE: " + process.env.MYSQL_DATABASE);
console.log("MYSQL_CONNECTIONLIMIT: " + process.env.MYSQL_CONNECTIONLIMIT);
console.log("===");
console.log("STATISTICS_SIGMAS: " + process.env.STATISTICS_SIGMAS);
console.log("===================================================================");
console.log();

// Merge of configuration (environment + yaml)
conf.port = process.env.PORT;
conf.address = process.env.ADDRESS;
conf.timezone = process.env.TZ;
conf.tests.auth = process.env.TESTS_AUTH;
conf.tests.statistic = process.env.TESTS_STATISTIC;
conf.tests.zero = process.env.TESTS_ZERO;
conf.mysql.host = process.env.MYSQL_HOST;
conf.mysql.port = process.env.MYSQL_PORT;
conf.mysql.user = process.env.MYSQL_USER;
conf.mysql.password = process.env.MYSQL_PASSWORD;
conf.mysql.database = process.env.MYSQL_DATABASE;
conf.mysql.connectionLimit = process.env.MYSQL_CONNECTIONLIMIT;
conf.statistics.sigmas = process.env.STATISTICS_SIGMAS;

module.exports = conf;
