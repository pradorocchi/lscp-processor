var assert = require('assert');
var lArray = require('lodash/array');
var lColl = require('lodash/collection');
var queries = require('../lib/queries.js');
var DbUtils = require('../lib/db-utils.js').DbUtils;
var common = require('./common.js');

describe('Call Count Tests', function () {
  var scores;
  beforeEach(function (done) {
    var finished = function () {
      scores = common.scores;
      done();
    };
    common.initDb(finished);
  });
  it('should invoke the callProcessedCounts without errors.', function (done) {
    var finished = function (callsProcessed) {
      done();
    };
    queries.callsProcessed(scores, finished);
  });
  it('should aggregate the scores in CPone.csv.', function (done) {
    var finished = function (callsProcessed) {
      var selector = { scorer: 'ARPIRAbellanesAU' };
      var selectorIndex = lArray.findIndex(callsProcessed, selector);
      var selectorCallCount = callsProcessed[selectorIndex].callCount;
      assert.equal(selectorCallCount, 2);
      selector = { scorer: 'ARPIAJBuenaAU' };
      selectorCallCount = lColl.filter(callsProcessed, selector).length;
      assert.equal(selectorCallCount, 2);
      assert.equal(callsProcessed.length, 27);
      done();
    };
    var saved = function () {
      queries.callsProcessed(scores, finished);
    };
    DbUtils.saveToDb(common.cpOne, scores, common.formatting, saved);
  });
  it('should aggregate the scores of \'ARPIAbellanesAU\' in CPone.csv.', function (done) {
    var selector = { scorer: 'ARPIRAbellanesAU' };
    var finished = function (callsProcessed) {
      assert.equal(callsProcessed[0].callCount, 2);
      assert.equal(callsProcessed.length, 1);
      done();
    };
    var saved = function () {
      queries.scorerCallsProcessed(scores, selector.scorer, finished);
    };
    DbUtils.saveToDb(common.cpOne, scores, common.formatting, saved);
  });
  it('should aggregate the scores of \'ARPIAJBuenaAU\' in CPone.csv.', function (done) {
    var selector = { scorer: 'ARPIAJBuenaAU' };
    var finished = function (callsProcessed) {
      var dayOneCount = lColl.pluck(
        lColl.filter(callsProcessed, { date: { day: 1 } } ), 'callCount'
      )[0];
      var dayTwoCount = lColl.pluck(
        lColl.filter(callsProcessed, { date: { day: 2 } } ), 'callCount'
      )[0];
      assert.equal(dayOneCount, 2);
      assert.equal(dayTwoCount, 1);
      assert.equal(callsProcessed.length, 2);
      done();
    };
    var saved = function () {
      queries.scorerCallsProcessed(scores, selector.scorer, finished);
    };
    DbUtils.saveToDb(common.cpOne, scores, common.formatting, saved);
  });
});
