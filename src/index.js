import _ from 'lodash'

const SEARCH_INPUT_TYPE = {
  INT: 'INT',
  STR: 'STR',
}
const createSearchFilters = ({searchConditions}) => {
  let searchFilters = {}
  if (searchConditions && Object.keys(searchConditions).length > 0) {
    searchConditions.forEach((item) => {
      if (item.searchType === SEARCH_INPUT_TYPE.STR) {
        searchFilters[item.searchField] = new RegExp(`.*${item.searchValue}.*`, 'i')
      } else if (item.searchType === SEARCH_INPUT_TYPE.INT) {
        searchFilters[item.searchField] = parseInt(item.searchValue)
      }
    })
  }
  return searchFilters
}

const lazyLoadingCondition = ({ matchCondition, lastId, orderFieldName, orderLastValue, sortType }) => {
  if (sortType === 1) {
    matchCondition['$or'] = [{
      $and: [{ [orderFieldName]: { $gte: orderLastValue } }, { '_id': { $gt: lastId } }]
    }, { [orderFieldName]: { $gt: orderLastValue } }];
  } else {
    matchCondition['$or'] = [{
      $and: [{ [orderFieldName]: { $lte: orderLastValue } }, { '_id': { $lt: lastId } }]
    }, { [orderFieldName]: { $lt: orderLastValue } }]
  }
}

const lazyLoadingResponseFromArray = async ({ result, orderFieldName, hasNextPage }) => {
  let edges = []
  await Promise.all(result.map(async record => {
    let edge = {
      cursor: new Buffer(JSON.stringify({ lastId: _.get(record, '_id'), orderLastValue: _.get(record, orderFieldName) })).toString('base64'),
      node: record
    };
    edges.push(edge)
  }))
  return {
    pageInfo: {
      hasNextPage
    },
    edges
  }
}

exports.fetchConnectionFromArray = async ({ model, filter, searchConditions, first = 5, after, sortType = 1, orderFieldName = "_id" }) => {
  let matchCondition = createSearchFilters({ searchConditions })

  if (after) {
    let unserializedAfter = JSON.parse(new Buffer(after, 'base64').toString('ascii'))
    let lastId = unserializedAfter.lastId
    let orderLastValue = unserializedAfter.orderLastValue
    lazyLoadingCondition({ matchCondition, lastId, orderFieldName, orderLastValue, sortType })
  }

  if(filter) {
    _.merge(matchCondition, filter)
  }

  let result = await model.find(matchCondition).sort({ [orderFieldName]: sortType }).limit(first + 1)

  // check hasNextPage
  let hasNextPage = false
  if (result.length && result.length > first) {
    hasNextPage = true
    result.pop()
  }

  return lazyLoadingResponseFromArray({ result, orderFieldName, hasNextPage })
}
