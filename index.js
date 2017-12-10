'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchConnectionFromArray = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsBase = require('js-base64');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var decodeBase64 = function decodeBase64(_ref) {
  var encodedStr = _ref.encodedStr;

  return _jsBase.Base64.decode(encodedStr);
};

var encodeBase64 = function encodeBase64(_ref2) {
  var value = _ref2.value;

  return _jsBase.Base64.encodeURI(value);
};

var lazyLoadingCondition = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref4) {
    var matchCondition = _ref4.matchCondition,
        lastId = _ref4.lastId,
        orderFieldName = _ref4.orderFieldName,
        orderLastValue = _ref4.orderLastValue,
        sortType = _ref4.sortType;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            if (!('$or' in matchCondition) || matchCondition || matchCondition['$or'] === undefined) {
              matchCondition['$or'] = [{}];
            }
            if (sortType === 1) {
              matchCondition['$and'] = [{ '$or': matchCondition['$or'] }, {
                '$or': [{
                  $and: [_defineProperty({}, orderFieldName, { $gte: orderLastValue }), { '_id': { $gt: lastId } }]
                }, _defineProperty({}, orderFieldName, { $gt: orderLastValue })]
              }];
            } else {
              matchCondition['$and'] = [{ '$or': matchCondition['$or'] }, {
                '$or': [{
                  $and: [_defineProperty({}, orderFieldName, { $lte: orderLastValue }), { '_id': { $lt: lastId } }]
                }, _defineProperty({}, orderFieldName, { $lt: orderLastValue })]
              }];
            }
            delete matchCondition['$or'];

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function lazyLoadingCondition(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var lazyLoadingResponseFromArray = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref10) {
    var result = _ref10.result,
        orderFieldName = _ref10.orderFieldName,
        hasNextPage = _ref10.hasNextPage,
        hasPreviousPage = _ref10.hasPreviousPage;
    var edges, edge, value;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            edges = [];
            edge = void 0;
            value = void 0;
            _context3.next = 5;
            return Promise.all(result.map(function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(record) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        value = JSON.stringify({
                          lastId: _lodash2.default.get(record, '_id'),
                          orderLastValue: _lodash2.default.get(record, orderFieldName)
                        });
                        edge = {
                          cursor: encodeBase64({ value: value }),
                          node: record
                        };
                        edges.push(edge);

                      case 3:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, undefined);
              }));

              return function (_x3) {
                return _ref11.apply(this, arguments);
              };
            }()));

          case 5:
            return _context3.abrupt('return', {
              pageInfo: {
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                startCursor: edges[0] ? edges[0].cursor : null,
                endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null
              },
              edges: edges
            });

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function lazyLoadingResponseFromArray(_x2) {
    return _ref9.apply(this, arguments);
  };
}();

var getMatchCondition = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref13) {
    var filter = _ref13.filter,
        cursor = _ref13.cursor,
        orderFieldName = _ref13.orderFieldName,
        sortType = _ref13.sortType;
    var matchCondition, unserializedAfter, lastId, orderLastValue;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            matchCondition = {};

            if (!cursor) {
              _context4.next = 7;
              break;
            }

            unserializedAfter = JSON.parse(decodeBase64({ encodedStr: cursor }));
            lastId = unserializedAfter.lastId;
            orderLastValue = unserializedAfter.orderLastValue;
            _context4.next = 7;
            return lazyLoadingCondition({ matchCondition: matchCondition, lastId: lastId, orderFieldName: orderFieldName, orderLastValue: orderLastValue, sortType: sortType });

          case 7:
            if (filter) {
              _lodash2.default.merge(matchCondition, filter);
            }

            return _context4.abrupt('return', matchCondition);

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getMatchCondition(_x4) {
    return _ref12.apply(this, arguments);
  };
}();

var fetchConnectionFromArray = exports.fetchConnectionFromArray = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref15) {
    var dataPromiseFunc = _ref15.dataPromiseFunc,
        filter = _ref15.filter,
        after = _ref15.after,
        before = _ref15.before,
        _ref15$first = _ref15.first,
        first = _ref15$first === undefined ? 5 : _ref15$first,
        last = _ref15.last,
        _ref15$orderFieldName = _ref15.orderFieldName,
        orderFieldName = _ref15$orderFieldName === undefined ? '_id' : _ref15$orderFieldName,
        _ref15$sortType = _ref15.sortType,
        sortType = _ref15$sortType === undefined ? 1 : _ref15$sortType;

    var hasNextPage, hasPreviousPage, result, matchCondition, _dataPromiseFunc$sort, _dataPromiseFunc$sort2, _dataPromiseFunc$sort3, _dataPromiseFunc$sort4, _dataPromiseFunc$sort5;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            hasNextPage = false;
            hasPreviousPage = false;
            result = [];
            matchCondition = {};

            if (!after) {
              _context5.next = 23;
              break;
            }

            _context5.next = 7;
            return getMatchCondition({
              filter: filter,
              cursor: after,
              orderFieldName: orderFieldName,
              sortType: sortType
            });

          case 7:
            matchCondition = _context5.sent;
            _context5.next = 10;
            return dataPromiseFunc(matchCondition).sort((_dataPromiseFunc$sort = {}, _defineProperty(_dataPromiseFunc$sort, orderFieldName, sortType), _defineProperty(_dataPromiseFunc$sort, '_id', sortType), _dataPromiseFunc$sort)).limit(first + 1).then(function (data) {
              return data;
            });

          case 10:
            result = _context5.sent;

            sortType *= -1;
            _context5.next = 14;
            return getMatchCondition({
              filter: filter,
              cursor: after,
              orderFieldName: orderFieldName,
              sortType: sortType
            });

          case 14:
            matchCondition = _context5.sent;
            _context5.t0 = Boolean;
            _context5.next = 18;
            return dataPromiseFunc(matchCondition).sort((_dataPromiseFunc$sort2 = {}, _defineProperty(_dataPromiseFunc$sort2, orderFieldName, sortType), _defineProperty(_dataPromiseFunc$sort2, '_id', sortType), _dataPromiseFunc$sort2)).count();

          case 18:
            _context5.t1 = _context5.sent;
            hasPreviousPage = (0, _context5.t0)(_context5.t1);

            if (result.length && result.length > first) {
              hasNextPage = true;
              result.pop();
            }
            _context5.next = 51;
            break;

          case 23:
            if (!(before || last)) {
              _context5.next = 44;
              break;
            }

            sortType *= -1;
            _context5.next = 27;
            return getMatchCondition({
              filter: filter,
              cursor: before,
              orderFieldName: orderFieldName,
              sortType: sortType
            });

          case 27:
            matchCondition = _context5.sent;
            _context5.next = 30;
            return dataPromiseFunc(matchCondition).sort((_dataPromiseFunc$sort3 = {}, _defineProperty(_dataPromiseFunc$sort3, orderFieldName, sortType), _defineProperty(_dataPromiseFunc$sort3, '_id', sortType), _dataPromiseFunc$sort3)).limit(last + 1).then(function (data) {
              return data.reverse();
            });

          case 30:
            result = _context5.sent;

            if (!before) {
              _context5.next = 41;
              break;
            }

            sortType *= -1;
            _context5.next = 35;
            return getMatchCondition({
              filter: filter,
              cursor: before,
              orderFieldName: orderFieldName,
              sortType: sortType
            });

          case 35:
            matchCondition = _context5.sent;
            _context5.t2 = Boolean;
            _context5.next = 39;
            return dataPromiseFunc(matchCondition).sort((_dataPromiseFunc$sort4 = {}, _defineProperty(_dataPromiseFunc$sort4, orderFieldName, sortType), _defineProperty(_dataPromiseFunc$sort4, '_id', sortType), _dataPromiseFunc$sort4)).count();

          case 39:
            _context5.t3 = _context5.sent;
            hasNextPage = (0, _context5.t2)(_context5.t3);

          case 41:
            if (result.length && result.length > last) {
              hasPreviousPage = true;
              result.shift();
            }
            _context5.next = 51;
            break;

          case 44:
            _context5.next = 46;
            return getMatchCondition({
              filter: filter,
              orderFieldName: orderFieldName,
              sortType: sortType
            });

          case 46:
            matchCondition = _context5.sent;
            _context5.next = 49;
            return dataPromiseFunc(matchCondition).sort((_dataPromiseFunc$sort5 = {}, _defineProperty(_dataPromiseFunc$sort5, orderFieldName, sortType), _defineProperty(_dataPromiseFunc$sort5, '_id', sortType), _dataPromiseFunc$sort5)).limit(first + 1).then(function (data) {
              return data;
            });

          case 49:
            result = _context5.sent;

            if (result.length && result.length > first) {
              hasNextPage = true;
              result.pop();
            }

          case 51:
            return _context5.abrupt('return', lazyLoadingResponseFromArray({
              result: result,
              orderFieldName: orderFieldName,
              hasNextPage: hasNextPage,
              hasPreviousPage: hasPreviousPage
            }));

          case 52:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function fetchConnectionFromArray(_x5) {
    return _ref14.apply(this, arguments);
  };
}();