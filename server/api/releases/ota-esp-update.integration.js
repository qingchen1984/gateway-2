'use strict';

var app = require('../../app');
var sqldb = require('../../sqldb');
var Release = sqldb.Release;

var fs = require('fs');

var request = require('supertest');


describe('[ESP8266 OTA Update]', function() {


  before(function functionName() {
    return Release.destroy({
      where: {}
    });
  });
  after(function functionName() {
    return Release.destroy({
      where: {}
    });
  });
  before(function() {
    return Release.bulkCreate([{
      type: 'ESP8266',
      major: 0,
      minor: 0,
      patch: 2,
      firmwareBlob: new Buffer('teste')
    }, {
      type: 'ESP8266',
      major: 0,
      minor: 0,
      patch: 1,
      firmwareBlob: new Buffer('fail')
    }])
  });



  describe('Device  type not supported', function() {
    it('should return 406', function(done) {
      request(app)
        .get('/releases/NOTFOUND/update')
        .set('USER-AGENT', 'ESP8266-http-Update')
        .set('X-ESP8266-STA-MAC', '18:FE:AA:AA:AA:AA')
        .set('X-ESP8266-AP-MAC', '1A:FE:AA:AA:AA:AA')
        .set('X-ESP8266-FREE-SPACE', '671744')
        .set('X-ESP8266-SKETCH-SIZE', '373940')
        .set('X-ESP8266-CHIP-SIZE', '4194304')
        .set('X-ESP8266-SDK-VERSION', '1.3.0')
        .set('X-ESP8266-VERSION', 'V0.1.1')
        .expect(406)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('No Update found', function() {

    it('should return 304', function(done) {
      request(app)
        .get('/releases/ESP8266/update')
        .set('USER-AGENT', 'ESP8266-http-Update')
        .set('X-ESP8266-STA-MAC', '18:FE:AA:AA:AA:AA')
        .set('X-ESP8266-AP-MAC', '1A:FE:AA:AA:AA:AA')
        .set('X-ESP8266-FREE-SPACE', '671744')
        .set('X-ESP8266-SKETCH-SIZE', '373940')
        .set('X-ESP8266-CHIP-SIZE', '4194304')
        .set('X-ESP8266-SDK-VERSION', '1.3.0')
        .set('X-ESP8266-VERSION', 'v0.0.2')
        .expect(304)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });


  });

  describe('Update not supported', function() {

    it('should have return 403 on missing USER-AGENT', function(done) {
      request(app)
        .get('/releases/ESP8266/update')
        .set('X-ESP8266-STA-MAC', '18:FE:AA:AA:AA:AA')
        .set('X-ESP8266-AP-MAC', '1A:FE:AA:AA:AA:AA')
        .set('X-ESP8266-FREE-SPACE', '671744')
        .set('X-ESP8266-SKETCH-SIZE', '373940')
        .set('X-ESP8266-CHIP-SIZE', '4194304')
        .set('X-ESP8266-SDK-VERSION', '1.3.0')
        .set('X-ESP8266-VERSION', '0.0.1')
        .expect(403)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should have return 403 on invalid USER-AGENT', function(done) {
      request(app)
        .get('/releases/ESP8266/update')
        .set('USER-AGENT', 'XYZ-http-Update')
        .set('X-ESP8266-STA-MAC', '18:FE:AA:AA:AA:AA')
        .set('X-ESP8266-AP-MAC', '1A:FE:AA:AA:AA:AA')
        .set('X-ESP8266-FREE-SPACE', '671744')
        .set('X-ESP8266-SKETCH-SIZE', '373940')
        .set('X-ESP8266-CHIP-SIZE', '4194304')
        .set('X-ESP8266-SDK-VERSION', '1.3.0')
        .set('X-ESP8266-VERSION', '0.0.1')
        .expect(403)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should have return 403 on missing X-ESP8266-*', function(done) {
      request(app)
        .get('/releases/ESP8266/update')
        .set('USER-AGENT', 'ESP8266-http-Update')
        .expect(403)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Update found', function() {
    var binary;
    before(function(done) {
      request(app)
        .get('/releases/ESP8266/update')
        .set('USER-AGENT', 'ESP8266-http-Update')
        .set('X-ESP8266-STA-MAC', '18:FE:AA:AA:AA:AA')
        .set('X-ESP8266-AP-MAC', '1A:FE:AA:AA:AA:AA')
        .set('X-ESP8266-FREE-SPACE', '671744')
        .set('X-ESP8266-SKETCH-SIZE', '373940')
        .set('X-ESP8266-CHIP-SIZE', '4194304')
        .set('X-ESP8266-SDK-VERSION', '1.3.0')
        .set('X-ESP8266-VERSION', '0.0.1')
        .expect(200)
        .expect('Content-Type', /octet-stream/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          binary = res.text;
          done();
        });
    });
    it('should respond with firmware binary', function() {
      binary.should.be.text;
      binary.should.match(/teste/);
    });
  });
});
