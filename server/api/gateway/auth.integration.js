'use strict';

var app = require('../../app');
var sqldb = require('../../sqldb');
var Registration = sqldb.Registration;
var request = require('supertest');
var auth = require('./auth.service');
var _ = require('lodash');


var req = {
  params: {
    device: 'TESTE'
  },
  headers: {},
  query: {},
};

var res = {
  statusCode: 0,
  status: function(statusCode) {
    res.statusCode = statusCode;
    return res;
  },
  send: function() {
    return res;
  }
};

describe('Auth.service', function() {



  before(function() {
    return Registration.destroy({
      where: {}
    });
  });

  describe('Unregistred device', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return auth.isAuthorized(req, res, () => {});
    });

    after(function() {
      res.statusCode = 0;
    });

    it('Shoud have just one registration', function() {
      return Registration.count({
        where: {
          device: 'TESTE'
        }
      }).should.eventually.be.least(1);
    });

    it('Shoud have returned status 401', function() {
      res.statusCode.should.be.equals(401);
    });
  });


  describe('Unregistred device 5 times', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });
    _.times(5, function() {
      before(function() {
        return auth.isAuthorized(req, res, () => {});
      });

      after(function() {
        res.statusCode = 0;
      });

      it('Shoud have just one registration', function() {
        return Registration.count({
          where: {
            device: 'TESTE'
          }
        }).should.eventually.be.least(1);
      });

      it('Shoud have returned status 401', function() {
        res.statusCode.should.be.equals(401);
      });
    });

  });

  describe('Registred device but not authorized', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE'
      });
    });
    before(function() {
      return auth.isAuthorized(req, res, () => {});
    });

    after(function() {
      res.statusCode = 0;
    });

    it('Shoud have just one registration', function() {
      return Registration.count({
        where: {
          device: 'TESTE'
        }
      }).should.eventually.be.least(1);
    });

    it('Shoud have returned status 401', function() {
      res.statusCode.should.be.equals(401);
    });
  });



  describe('Registred device but not authorized 5 times', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE'
      });
    });

    _.times(5, function() {
      before(function() {
        return auth.isAuthorized(req, res, () => {});
      });

      after(function() {
        res.statusCode = 0;
      });

      it('Shoud have just one registration', function() {
        return Registration.count({
          where: {
            device: 'TESTE'
          }
        }).should.eventually.be.least(1);
      });

      it('Shoud have returned status 401', function() {
        res.statusCode.should.be.equals(401);
      });
    });
  });


  describe('Registred device but authorized', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE',
        device_group: 'TESTE'
      });
    });
    it('Shoud have authorized', function(done) {
      auth.isAuthorized(req, res, done);
    });
    after(function() {
      res.statusCode = 0;
    });
  });

  describe('Registred device but authorized 5 times', function() {
    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE',
        device_group: 'TESTE',
        registrationDate: Date.now()
      });
    });

    _.times(5, function() {
      it('Shoud have authorized', function(done) {
        auth.isAuthorized(req, res, done);
      });
    });

    after(function() {
      res.statusCode = 0;
    });
  });

  describe('No token', function() {
    before(function() {
      return auth.isAuthenticated(req, res, () => {});
    });

    it('should have returned 403', function() {
      res.statusCode.should.be.equals(403);
    });
  });

  describe('Invalid token', function() {
    before(function() {
      var newReq = _.clone(req);
      newReq.headers.authorization = '12312313123131312312312'
      return auth.isAuthenticated(newReq, res, () => {});
    });

    it('should have returned 403', function() {
      res.statusCode.should.be.equals(403);
    });
  });


  describe('Valid token but not authorized', function() {

    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE'
      });
    });

    before(function() {
      var newReq = _.clone(req);
      newReq.headers.authorization = auth.signToken('TESTE');
      return auth.isAuthenticated(newReq, res, () => {});
    });

    it('should have returned 401', function() {
      res.statusCode.should.be.equals(401);
    });
  });

  describe('Valid token', function() {

    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.create({
        device: 'TESTE',
        device_group: 'TESTE',
        registrationDate: Date.now()
      });
    });

    it('should have authenticated', function(done) {
      var newReq = _.clone(req);
      newReq.headers.authorization = auth.signToken('TESTE');
      return auth.isAuthenticated(newReq, res, done);

    });
  });


});
