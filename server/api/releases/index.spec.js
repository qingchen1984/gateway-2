'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var releasesCtrlStub = {
  show: 'releasesCtrl.show',
  update: 'releasesCtrl.update'
};



var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};


// require the index with our stubbed out modules
var releasesIndex = proxyquire('./index', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './releases.controller': releasesCtrlStub
});

describe('OTA Update API Router:', function() {

  it('should return an express router instance', function() {
    releasesIndex.should.equal(routerStub);
  });


  describe('GET /releases/:type', function() {

    it('should route to releases.controller.show', function() {
      routerStub.get
        .withArgs('/:type', 'releasesCtrl.show')
        .should.have.been.calledOnce;
    });
  });


  describe('GET /releases/:type/update', function() {

    it('should route to releases.controller.update', function() {
      routerStub.get
        .withArgs('/:type/update', 'releasesCtrl.update')
        .should.have.been.calledOnce;
    });
  });


});
