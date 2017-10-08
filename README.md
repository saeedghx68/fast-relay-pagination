# Fast Relay Pagination

Fast Relay pagination is a library to improve [`graphql-relay`][graphqlRelayGithub] lazy loading by using [`mongoose`][mongooseGithub] **find** and **limit**. As you definitely know,  `graphql-relay`'s `connectionFromArray` fetchs all data and perform slicing on data which is not efficient for large amount of data fetched from `mongodb`.

# Installation

#### NPM

```sh
$ npm install -g fast-relay-pagination
```
# Usage
The only effort you need, is using `fetchConnectionFromArray` method from library. 
```js
...
import {fetchConnectionFromArray} from 'fast-relay-pagination'
...

export default {
  type: connection.connectionType,
  args: {
    ...connectionArgs,
    searchConditions: {
      type: new GraphQLList(new GraphQLNonNull(SearchConditionInputType)),
    },
    orderFieldName: {
      type: GraphQLString,
    },
    sortType: {
      type: GraphQLInt,
    },
  },
  resolve: async (_, args) => {
    return fetchConnectionFromArray({
      model: SomeMongooseModel,
      first: args.first, // OPTIONAL
      after: args.after, // OPTIONAL
      filter, // OPTIONAL
      searchConditions: args.searchConditions, // OPTIONAL
      sortType: args.sortType, // OPTIONAL
      orderFieldName: args.orderFieldName, // OPTIONAL
    })
  },
}
```

You may probably ask about `SearchConditionInputType`. The following lines shows `SearchConditionInputType` code:

```js
export default new GraphQLInputObjectType({
  name: 'SearchConditionInputType',
  fields: {
    searchField: {
      type: new GraphQLNonNull(GraphQLString),
    },
    searchValue: {
      type: new GraphQLNonNull(GraphQLString),
    },
    searchType: {
      type: new GraphQLNonNull(SearchInputTypeEnum),
    },
  },
})
```

##### Production Notes
 - This library currently is only supporting `mongodb` and `mongoose`

### Development
Want to contribute? Great!
- Fork the repo on GitHub
- Clone the project to your own machine
- Commit changes to your own branch
- Push your work back up to your fork
- Submit a Pull request so that we can review your changes

# TODO
`last` and `before` will be available as soon as possible.


Copyright and Licensing
-----------------------

fast-relay-pagination is open source projects are licensed under the Apache 2.0 license.

fast-relay-pagination does not require you to assign the copyright of your contributions, you retain the copyright. fast-relay-pagination does require that you make your contributions available under the Apache license in order to be included in the main repo.

If appropriate, include the Apache 2.0 license summary at the top of each file along with the copyright info. If you are adding a new file that you wrote, include your name in the copyright notice in the license summary at the top of the file.

### License Summary

You can copy and paste the Apache 2.0 license summary from below.

```
Copyright 2017 by Saeed Gharedaghi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

   [mongooseGithub]: <https://github.com/Automattic/mongoose>
   [graphqlRelayGithub]: <https://github.com/graphql/graphql-relay-js>

