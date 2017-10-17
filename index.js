'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMatchCondition = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var lazyLoadingCondition = function lazyLoadingCondition(_ref) {
  var matchCondition = _ref.matchCondition,
      lastId = _ref.lastId,
      orderFieldName = _ref.orderFieldName,
      orderLastValue = _ref.orderLastValue,
      sortType = _ref.sortType;

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
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref7) {
    var result = _ref7.result,
        orderFieldName = _ref7.orderFieldName,
        hasNextPage = _ref7.hasNextPage;
    var edges;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            edges = [];
            _context2.next = 3;
            return Promise.all(result.map(function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(record) {
                var edge;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        edge = {
                          cursor: new Buffer(JSON.stringify({
                            lastId: _lodash2.default.get(record, '_id'),
                            orderLastValue: _lodash2.default.get(record, orderFieldName)
                          })).toString('base64'),
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
                return _ref8.apply(this, arguments);
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
    return _ref6.apply(this, arguments);
  };
}();

var getMatchCondition = exports.getMatchCondition = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref10) {
    var _ref10$filter = _ref10.filter,
        filter = _ref10$filter === undefined ? {} : _ref10$filter,
        after = _ref10.after,
        orderFieldName = _ref10.orderFieldName,
        sortType = _ref10.sortType;
    var matchCondition, unserializedAfter, lastId, orderLastValue;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            matchCondition = filter;


            if (after) {
              unserializedAfter = JSON.parse(new Buffer(after, 'base64').toString('ascii'));
              lastId = unserializedAfter.lastId;
              orderLastValue = unserializedAfter.orderLastValue;

              lazyLoadingCondition({ matchCondition: matchCondition, lastId: lastId, orderFieldName: orderFieldName, orderLastValue: orderLastValue, sortType: sortType });
            }

            return _context3.abrupt('return', matchCondition);

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getMatchCondition(_x3) {
    return _ref9.apply(this, arguments);
  };
}();

exports.fetchConnectionFromArray = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref12) {
    var dataPromise = _ref12.dataPromise,
        _ref12$first = _ref12.first,
        first = _ref12$first === undefined ? 5 : _ref12$first,
        _ref12$sortType = _ref12.sortType,
        sortType = _ref12$sortType === undefined ? 1 : _ref12$sortType,
        _ref12$orderFieldName = _ref12.orderFieldName,
        orderFieldName = _ref12$orderFieldName === undefined ? '_id' : _ref12$orderFieldName;
    var result, hasNextPage;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return dataPromise.sort(_defineProperty({}, orderFieldName, sortType)).limit(first + 1).then(function (data) {
              return data;
            });

          case 2:
            result = _context4.sent;


            // check hasNextPage
            hasNextPage = false;

            if (result.length && result.length > first) {
              hasNextPage = true;
              result.pop();
            }

            return _context4.abrupt('return', lazyLoadingResponseFromArray({ result: result, orderFieldName: orderFieldName, hasNextPage: hasNextPage }));

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x4) {
    return _ref11.apply(this, arguments);
  };
}();