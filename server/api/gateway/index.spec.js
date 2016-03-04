'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var gatewayCtrlStub = {
  show: 'gatewayCtrl.show',
  create: 'gatewayCtrl.create',
  ack: 'gatewayCtrl.ack',
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};


// require the index with our stubbed out modules
var gatewayIndex = proxyquire('./index', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './gateway.controller': gatewayCtrlStub
});

describe('Gateway API Router:', function() {

  it('should return an express router instance', function() {
    gatewayIndex.should.equal(routerStub);
  });


  describe('GET /api/gateway/:device', function() {

    it('should route to gateway.controller.show', function() {
      routerStub.get
        .withArgs('/:device', 'gatewayCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/gateway', function() {

    it('should route to gateway.controller.create', function() {
      routerStub.post
        .withArgs('/:device', 'gatewayCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/gateway/:device', function() {

    it('should route to gateway.controller.ack', function() {
      routerStub.put
        .withArgs('/:device', 'gatewayCtrl.ack')
        .should.have.been.calledOnce;
    });
  });


});
