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
var registration = require('./registration.controller');

var router = express.Router();

// Routes for Root
router.get('/', controller.getTime);
router.post('/', controller.save);

// Routes for /api/registration/
router.get('/api/registration/', registration.get);
router.post('/api/registration/', registration.post);
router.delete('/api/registration/', registration.delete);
router.put('/api/registration/', registration.put);



module.exports = router;