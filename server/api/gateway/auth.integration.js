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
  }
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

  describe('Unregistred device', function(done) {
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

    it('Shoud have returned status 403', function() {
      res.statusCode.should.be.equals(403);
    });
  });


  describe('Unregistred device 5 times', function(done) {
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

      it('Shoud have returned status 403', function() {
        res.statusCode.should.be.equals(403);
      });
    });

  });

  describe('Registred device but not authorized', function(done) {
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

    it('Shoud have returned status 403', function() {
      res.statusCode.should.be.equals(403);
    });
  });



  describe('Registred device but not authorized 5 times', function(done) {
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

      it('Shoud have returned status 403', function() {
        res.statusCode.should.be.equals(403);
      });
    });
  });


  describe('Registred device but authorized', function(done) {
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

  describe('Registred device but authorized 5 times', function(done) {
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

    _.times(5,function() {
      it('Shoud have authorized', function(done) {
        auth.isAuthorized(req, res, done);
      });
    });

    after(function() {
      res.statusCode = 0;
    });
  });

});
