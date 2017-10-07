'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SEARCH_INPUT_TYPE = {
  INT: 'INT',
  STR: 'STR'
};
var createSearchFilters = function createSearchFilters(_ref) {
  var searchConditions = _ref.searchConditions;

  var searchFilters = {};
  if (searchConditions && Object.keys(searchConditions).length > 0) {
    searchConditions.forEach(function (item) {
      if (item.searchType === SEARCH_INPUT_TYPE.STR) {
        searchFilters[item.searchField] = new RegExp('.*' + item.searchValue + '.*', 'i');
      } else if (item.searchType === SEARCH_INPUT_TYPE.INT) {
        searchFilters[item.searchField] = parseInt(item.searchValue);
      }
    });
  }
  return searchFilters;
};

var lazyLoadingCondition = function lazyLoadingCondition(_ref2) {
  var matchCondition = _ref2.matchCondition,
      lastId = _ref2.lastId,
      orderFieldName = _ref2.orderFieldName,
      orderLastValue = _ref2.orderLastValue,
      sortType = _ref2.sortType;

  if (sortType === 1) {
    matchCondition['$or'] = [{
      $and: [_defineProperty({}, orderFieldName, { $gte: orderLastValue }), { '_id': { $gt: lastId } }]
    }, _defineProperty({}, orderFieldName, { $gt: orderLastValue })];
  } else {
    matchCondition['$or'] = [{
      $and: [_defineProperty({}, orderFieldName, { $lte: orderLastValue }), { '_id': { $lt: lastId } }]
    }, _defineProperty({}, orderFieldName, { $lt: orderLastValue })];
  }
};

var lazyLoadingResponseFromArray = async function lazyLoadingResponseFromArray(_ref7) {
  var result = _ref7.result,
      orderFieldName = _ref7.orderFieldName,
      hasNextPage = _ref7.hasNextPage;

  var edges = [];
  await Promise.all(result.map(async function (record) {
    var edge = {
      cursor: new Buffer(JSON.stringify({ lastId: _lodash2.default.get(record, '_id'), orderLastValue: _lodash2.default.get(record, orderFieldName) })).toString('base64'),
      node: record
    };
    edges.push(edge);
  }));
  return {
    pageInfo: {
      hasNextPage: hasNextPage
    },
    edges: edges
  };
};

exports.fetchConnectionFromArray = async function (_ref8) {
  var model = _ref8.model,
      searchConditions = _ref8.searchConditions,
      _ref8$first = _ref8.first,
      first = _ref8$first === undefined ? 5 : _ref8$first,
      after = _ref8.after,
      _ref8$sortType = _ref8.sortType,
      sortType = _ref8$sortType === undefined ? 1 : _ref8$sortType,
      _ref8$orderFieldName = _ref8.orderFieldName,
      orderFieldName = _ref8$orderFieldName === undefined ? "_id" : _ref8$orderFieldName;

  var matchCondition = createSearchFilters({ searchConditions: searchConditions });

  if (after) {
    var unserializedAfter = JSON.parse(new Buffer(after, 'base64').toString('ascii'));
    var lastId = unserializedAfter.lastId;
    var orderLastValue = unserializedAfter.orderLastValue;
    lazyLoadingCondition({ matchCondition: matchCondition, lastId: lastId, orderFieldName: orderFieldName, orderLastValue: orderLastValue, sortType: sortType });
  }

  var result = await model.find(matchCondition).sort(_defineProperty({}, orderFieldName, sortType)).limit(first + 1);

  // check hasNextPage
  var hasNextPage = false;
  if (result.length && result.length > first) {
    hasNextPage = true;
    result.pop();
  }

  return lazyLoadingResponseFromArray({ result: result, orderFieldName: orderFieldName, hasNextPage: hasNextPage });
};