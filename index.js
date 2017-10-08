'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var lazyLoadingResponseFromArray = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref8) {
    var result = _ref8.result,
        orderFieldName = _ref8.orderFieldName,
        hasNextPage = _ref8.hasNextPage;
    var edges;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            edges = [];
            _context2.next = 3;
            return Promise.all(result.map(function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(record) {
                var edge;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        edge = {
                          cursor: new Buffer(JSON.stringify({ lastId: _lodash2.default.get(record, '_id'), orderLastValue: _lodash2.default.get(record, orderFieldName) })).toString('base64'),
                          node: record
                        };

                        edges.push(edge);

                      case 2:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x2) {
                return _ref9.apply(this, arguments);
              };
            }()));

          case 3:
            return _context2.abrupt('return', {
              pageInfo: {
                hasNextPage: hasNextPage
              },
              edges: edges
            });

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function lazyLoadingResponseFromArray(_x) {
    return _ref7.apply(this, arguments);
  };
}();

exports.fetchConnectionFromArray = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref11) {
    var model = _ref11.model,
        filter = _ref11.filter,
        searchConditions = _ref11.searchConditions,
        _ref11$first = _ref11.first,
        first = _ref11$first === undefined ? 5 : _ref11$first,
        after = _ref11.after,
        _ref11$sortType = _ref11.sortType,
        sortType = _ref11$sortType === undefined ? 1 : _ref11$sortType,
        _ref11$orderFieldName = _ref11.orderFieldName,
        orderFieldName = _ref11$orderFieldName === undefined ? "_id" : _ref11$orderFieldName;
    var matchCondition, unserializedAfter, lastId, orderLastValue, result, hasNextPage;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            matchCondition = createSearchFilters({ searchConditions: searchConditions });


            if (after) {
              unserializedAfter = JSON.parse(new Buffer(after, 'base64').toString('ascii'));
              lastId = unserializedAfter.lastId;
              orderLastValue = unserializedAfter.orderLastValue;

              lazyLoadingCondition({ matchCondition: matchCondition, lastId: lastId, orderFieldName: orderFieldName, orderLastValue: orderLastValue, sortType: sortType });
            }

            if (filter) {
              _lodash2.default.merge(matchCondition, filter);
            }

            _context3.next = 5;
            return model.find(matchCondition).sort(_defineProperty({}, orderFieldName, sortType)).limit(first + 1);

          case 5:
            result = _context3.sent;


            // check hasNextPage
            hasNextPage = false;

            if (result.length && result.length > first) {
              hasNextPage = true;
              result.pop();
            }

            return _context3.abrupt('return', lazyLoadingResponseFromArray({ result: result, orderFieldName: orderFieldName, hasNextPage: hasNextPage }));

          case 9:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x3) {
    return _ref10.apply(this, arguments);
  };
}();