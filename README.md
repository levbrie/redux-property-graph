# redux-property-graph
Basic property graph for redux. Note: This module is under development and not ready for use.

```javascript

// Reducer must be initialized with a unique id property name for nodes
const graph = require('redux-property-graph')({ idPropertyName: 'id' }).default

const rootReducer = combineReducers({
  graph
})
const store = createStore(rootReducer)
```


```javascript
import {
  addNode, addEdge, modifyNode,
  removeNode, unlinkNode, unlinkTwo
} from 'redux-property-graph/ActionCreators'

// addNode(object, label(s))
// object must contain an id property
// label(s) can be a single string or an array of labels
store.dispatch(addNode({ id: '1', name: 'Sam' }, 'Person'))

// addEdge(source, label, target, properties)
// source and target objects must contain ids
store.dispatch(addEdge({ id: '1' }, 'KNOWS', { id: '2' }, { since: 2015 }))

// modifyNode(newProperties, label(s))
store.dispatch(modifyNode({ id: '1', name: 'Samurdha' }, 'Human'))

// removeNode(object)
store.dispatch(removeNode({ id: '1' }))

// unlinkNode(object)
store.dispatch(unlinkNode({ id: '1' }))

// unlinkTwo(object1, object2)
store.dispatch(unlinkTwo({ id: '1' }, { id: '2' }))


const { getEdgeWithLabelBetween } = require('redux-property-graph')({ idPropertyName: 'id' })

getEdgeWithLabelBetween(graph, label, start, end)

getEdgesBetween(graph, start, end)

```