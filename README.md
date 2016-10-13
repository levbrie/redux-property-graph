# redux-property-graph
Basic property graph for redux. Note: This module is under development and not ready for use.

```javascript
import createGraphReducer from 'redux-property-graph'

// Reducer must be initialized with a unique id property name for nodes
const graph = createGraphReducer({ idPropertyName: 'id' })

const rootReducer = combineReducers({
  graph
})
const store = createStore(rootReducer)
```


```javascript
import { addNode, addEdge, removeNode, unlinkNode } from 'redux-property-graph'

// addNode(object, label(s))
// object must contain an id property
// label(s) can be a single string or an array of labels
store.dispatch(addNode({ id: '1', name: 'Sam' }, 'Person'))

// addEdge(source, label, target, properties)
// source and target objects must contain ids
store.dispatch(addNode({ id: '1' }, 'KNOWS', { id: '2' }, { since: 2015 }))

// removeNode(object)
store.dispatch(removeNode({ id: '1' }))

// unlinkNode(object)
store.dispatch(unlinkNode({ id: '1' }))
```