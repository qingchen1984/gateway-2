'use strict';

var app = require('../../app');
var sqldb = require('../../sqldb');
var Message = sqldb.Message;
var Registration = sqldb.Registration;
var Announcement = sqldb.Announcement;
var Fact = sqldb.Fact;
var DeviceStatistics = sqldb.DeviceStatistics;
var request = require('supertest');

var newMessage;

describe('Message API:', function() {
  describe('PUT /api/gateway/:device text/plain', function() {
    var messages;

    before(function() {
      return Registration.create({
        device: '66:66:66:66:66:66',
        device_group: '666',
        registrationDate: null
      });
    });
    after(function() {
      return Registration.destroy({
        where: {}
      });
    });

    beforeEach(function(done) {
      request(app)
        .put('/api/gateway/66:66:66:66:66:66')
        .set('Accept', 'text/plain')
        .expect(200)
        .expect('Content-Type', /plain/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          messages = res.text;
          done();
        });
    });

    it('should respond with device group', function() {
      messages.should.be.text;
      messages.should.match(/666\r\n(.*)/);
    });
  });


  describe('PUT /api/gateway/:device application/json', function() {
    var messages;

    before(function() {
      return Registration.create({
        device: '66:66:66:66:66:66',
        device_group: 666,
        registrationDate: null
      });
    });
    after(function() {
      return Registration.destroy({
        where: {}
      });
    });

    beforeEach(function(done) {
      request(app)
        .put('/api/gateway/66:66:66:66:66:66')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          messages = res.body;
          done();
        });
    });

    it('should respond with device group', function() {
      messages.should.be.instanceOf(Object);
      messages.device_group.should.match(/666\r\n(.*)/);
    });
  });


  describe('PUT /api/gateway/:device application/json', function() {
    it('should respond with 403 when device does not exist', function(done) {
      request(app)
        .put('/api/gateway/FF:FF:FF:FF:FF:BB')
        .expect(403)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });
    it('should have registered a device in WAITING_APPROVE status', function() {
      return Registration.findAll({
        where: {
          device: 'FF:FF:FF:FF:FF:BB',
          device_group: null,
          registrationDate: null
        }
      }).should.eventually.have.length(1);
    });
  });


  describe('GET /api/gateway/:device', function() {
    var message = {
      device: '66:66:66:66:66:66',
      sender: 'TESTE',
      delivery_type: 'PERSISTENT',
      message: 'REBOOT'
    };


    before(function() {
      return Registration.destroy({
        where: {}
      });
    });

    before(function() {
      return Registration.bulkCreate([{
        device: '66:66:66:66:66:66',
        device_group: 666,
        registrationDate: new Date()
      }]);
    });

    before(function() {
      return Announcement.destroy({
        where: {}
      });
    });

    after(function() {
      return Announcement.count().should.eventually.be.least(1, 'should have at least 1 Announcement');
    });

    before(function() {
      return Message.bulkCreate([message, {
        device: '66:66:66:66:66:66',
        sender: 'TESTE',
        delivery_type: 'TRANSIENT',
        message: 'REBOOT'
      }]);
    });

    after(function() {
      return Registration.destroy({
        where: {}
      });
    });

    after(function() {
      return Message.destroy({
        where: {}
      });
    });

    it('should respond with messages text format', function(done) {
      request(app)
        .get('/api/gateway/66:66:66:66:66:66')
        .set('Accept', 'text/plain')
        .expect(200)
        .expect('Content-Type', /text/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.text.should.be.text
          res.text.should.match(/(.*)\r\nREBOOT\r\n/);

          done();

        });
    });
    it('should respond with messages json format', function(done) {
      request(app)
        .get('/api/gateway/66:66:66:66:66:66')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.be.instanceOf(Object);
          res.body.should.have.property('dateTime');
          res.body.messages.should.be.instanceOf(Array);
          res.body.messages.should.contain.an.item.with.property('message', message.message);

          done();

        });


    });

    it('should mark messages as read', function() {
      return Message.count({
        where: {
          readDate: {
            $not: null
          }
        }
      }).should.eventually.be.least(2, 'should have at least 2 Messages');
    });


    describe('Tests when the device does not exist', function() {

      it('should respond with 403 when the device does not exist', function(done) {
        request(app)
          .get('/api/gateway/FF:FF:FF:FF:FF:BB')
          .expect(403)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            done();
          });
      });


      it('should have registered a device in WAITING_APPROVE status', function() {
        return Registration.findAll({
          where: {
            device: 'FF:FF:FF:FF:FF:BB',
            device_group: null,
            registrationDate: null
          }
        }).should.eventually.have.length(1);
      });
    });
  });
  describe('POST /api/gateway/:device', function() {
    before(function() {
      return Registration.bulkCreate([{
        device: '66:66:66:66:66:66',
        device_group: 666,
        registrationDate: null
      },
      {
        device: 'FF:FF:FF:FF:FF:BB',
        device_group: 666,
        registrationDate: null
      }]);
    });

    before(function() {
      return DeviceStatistics.create({
        device: 'FF:FF:FF:FF:FF:BB',
        sensor: 1,
        deviation: 1
      });
    });
    before(function() {
      return Fact.destroy({
        where: {}
      });
    });

    after(function() {
      return Fact.destroy({
        where: {}
      });
    });
    after(function() {
      return Registration.destroy({
        where: {}
      });
    });


    it('Send facts', function(done) {
      request(app)
        .post('/api/gateway/66:66:66:66:66:66')
        .send(
          [{
            'channel': 'test',
            'start': Date.now(),
            'delta': 0,
            'device_group': '666',
            'device': '66:66:66:66:66:66',
            'sensor': 1,
            'data': 1
          }, {
            'channel': 'test',
            'start': Date.now(),
            'delta': 0,
            'device_group': '666',
            'device': '66:66:66:66:66:66',
            'sensor': 2,
            'data': 1
          },
          {
            'channel': 'test',
            'start': Date.now(),
            'delta': 0,
            'device_group': '666',
            'device': 'FF:FF:FF:FF:FF:BB',
            'sensor': 1,
            'data': 9999
          }]
        )
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should have save facts', function() {
      return Fact.findAll({
        where: {
          device: '66:66:66:66:66:66',
          device_group: '666',
          sensor: [1,2]
        }
      }).should.eventually.have.length(2);
    });
    it('should have ignored noise sensor date', function() {
      return Fact.findAll({
        where: {
          device: 'FF:FF:FF:FF:FF:BB',
          device_group: '666',
          sensor: [1,2]
        }
      }).should.eventually.have.length(0);
    });
  });
});
