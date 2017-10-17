import _ from 'lodash'


const lazyLoadingCondition = ({matchCondition, lastId, orderFieldName, orderLastValue, sortType}) => {
  if (sortType === 1) {
    matchCondition['$or'] = [{
      $and: [{[orderFieldName]: {$gte: orderLastValue}}, {'_id': {$gt: lastId}}],
    }, {[orderFieldName]: {$gt: orderLastValue}}]
  } else {
    matchCondition['$or'] = [{
      $and: [{[orderFieldName]: {$lte: orderLastValue}}, {'_id': {$lt: lastId}}],
    }, {[orderFieldName]: {$lt: orderLastValue}}]
  }
}

const lazyLoadingResponseFromArray = async ({result, orderFieldName, hasNextPage}) => {
  let edges = []
  await Promise.all(result.map(async record => {
    let edge = {
      cursor: new Buffer(JSON.stringify({
        lastId: _.get(record, '_id'),
        orderLastValue: _.get(record, orderFieldName),
      })).toString('base64'),
      node: record,
    }
    edges.push(edge)
  }))
  return {
    pageInfo: {
      hasNextPage,
    },
    edges,
  }
}

export const getMatchCondition = async ({filter={}, after, orderFieldName, sortType}) => {
  let matchCondition = filter

  if (after) {
    let unserializedAfter = JSON.parse(new Buffer(after, 'base64').toString('ascii'))
    let lastId = unserializedAfter.lastId
    let orderLastValue = unserializedAfter.orderLastValue
    lazyLoadingCondition({matchCondition, lastId, orderFieldName, orderLastValue, sortType})
  }

  return matchCondition
}

exports.fetchConnectionFromArray = async ({dataPromise, first = 5, sortType = 1, orderFieldName = '_id'}) => {
  let result = await dataPromise.sort({[orderFieldName]: sortType}).limit(first + 1).then(data => data)

  // check hasNextPage
  let hasNextPage = false
  if (result.length && result.length > first) {
    hasNextPage = true
    result.pop()
  }

  return lazyLoadingResponseFromArray({result, orderFieldName, hasNextPage})
}

