# redux-property-graph
Basic property graph for redux

```es6
import createGraphReducer from 'redux-property-graph'

const graph = createGraphReducer({ idPropertyName: 'id' })

const rootReducer = combineReducers({
  graph
})
const store = createStore(rootReducer)
```