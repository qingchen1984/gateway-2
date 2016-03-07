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
var controller = require('./gateway.controller');
var auth = require('./auth.service');

var router = express.Router();

// Routes for Root
router.get('/:device', auth.isAuthorized, controller.show);
router.post('/:device',auth.isAuthorized, controller.create);
router.put('/:device',auth.isAuthorized, controller.ack);

module.exports = router;
