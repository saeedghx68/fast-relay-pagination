import _ from 'lodash'
import { Base64 } from 'js-base64'

const decodeBase64 = ({encodedStr}) => {
  return Base64.decode(encodedStr)
}

const encodeBase64 = ({value}) => {
  return Base64.encodeURI(value)
}

const lazyLoadingCondition = async ({matchCondition, lastId, orderFieldName, orderLastValue, sortType}) => {

  if (!('$or' in matchCondition) || matchCondition || matchCondition['$or'] === undefined) {
    matchCondition['$or'] = [{}]
  }
  if (sortType === 1) {
    matchCondition['$and'] = [{'$or': matchCondition['$or']},
      {
        '$or': [{
          $and: [{[orderFieldName]: {$gte: orderLastValue}}, {'_id': {$gt: lastId}}],
        }, {[orderFieldName]: {$gt: orderLastValue}}],
      }]
  } else {
    matchCondition['$and'] = [{'$or': matchCondition['$or']}, {
      '$or': [{
        $and: [{[orderFieldName]: {$lte: orderLastValue}}, {'_id': {$lt: lastId}}],
      }, {[orderFieldName]: {$lt: orderLastValue}}],
    }]
  }
  delete matchCondition['$or']
}

const lazyLoadingResponseFromArray = async ({result, orderFieldName, hasNextPage, hasPreviousPage}) => {
  let edges = []
  let edge
  let value
  await Promise.all(result.map(async record => {
    value = JSON.stringify({
      lastId: _.get(record, '_id'),
      orderLastValue: _.get(record, orderFieldName),
    })
    edge = {
      cursor: encodeBase64({value}),
      node: record,
    }
    edges.push(edge)
  }))
  return {
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges[0] ? edges[0].cursor : null,
      endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
    },
    edges,
  }
}

const getMatchCondition = async ({filter, cursor, orderFieldName, sortType}) => {
  let matchCondition = {}

  if (cursor) {
    let unserializedAfter = JSON.parse(decodeBase64({encodedStr: cursor}))
    let lastId = unserializedAfter.lastId
    let orderLastValue = unserializedAfter.orderLastValue
    await lazyLoadingCondition({matchCondition, lastId, orderFieldName, orderLastValue, sortType})
  }
  if (filter) {
    _.merge(matchCondition, filter)
  }

  return matchCondition
}

export const fetchConnectionFromArray = async ({
                                                 dataPromiseFunc,
                                                 filter,
                                                 after,
                                                 before,
                                                 first = 5,
                                                 last,
                                                 orderFieldName = '_id',
                                                 sortType = 1,
                                               }) => {
  let hasNextPage = false
  let hasPreviousPage = false
  let result = []
  let matchCondition = {}

  if (after) {
    matchCondition = await getMatchCondition({
      filter,
      cursor: after,
      orderFieldName,
      sortType,
    })
    result = await dataPromiseFunc(matchCondition).sort({
      [orderFieldName]: sortType,
      _id: sortType,
    }).limit(first + 1).then(data => data)
    sortType *= -1
    matchCondition = await getMatchCondition({
      filter,
      cursor: after,
      orderFieldName,
      sortType,
    })
    hasPreviousPage = Boolean(await dataPromiseFunc(matchCondition).sort({
      [orderFieldName]: sortType,
      _id: sortType,
    }).count())
    if (result.length && result.length > first) {
      hasNextPage = true
      result.pop()
    }
  } else if (before || last) {
    sortType *= -1
    matchCondition = await getMatchCondition({
      filter,
      cursor: before,
      orderFieldName,
      sortType,
    })
    result = await dataPromiseFunc(matchCondition).sort({
      [orderFieldName]: sortType,
      _id: sortType,
    }).limit(last + 1).then(data => data.reverse())
    if (before) {
      sortType *= -1
      matchCondition = await getMatchCondition({
        filter,
        cursor: before,
        orderFieldName,
        sortType,
      })
      hasNextPage = Boolean(await dataPromiseFunc(matchCondition).sort({
        [orderFieldName]: sortType,
        _id: sortType,
      }).count())
    }
    if (result.length && result.length > last) {
      hasPreviousPage = true
      result.shift()
    }
  } else {
    matchCondition = await getMatchCondition({
      filter,
      orderFieldName,
      sortType: sortType,
    })
    result = await dataPromiseFunc(matchCondition).sort({
      [orderFieldName]: sortType,
      _id: sortType,
    }).limit(first + 1).then(data => data)
    if (result.length && result.length > first) {
      hasNextPage = true
      result.pop()
    }
  }

  return lazyLoadingResponseFromArray({
    result,
    orderFieldName,
    hasNextPage,
    hasPreviousPage,
  })
}
