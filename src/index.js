import uuid from 'node-uuid';
import { ADD_NODE, ADD_EDGE, REMOVE_NODE, UNLINK_NODE } from './ActionTypes';

const _ = {
  transform: require('lodash.transform'),
  omit: require('lodash.omit')
};

export default createGraphReducer;

export const addNode = makeActionCreator(ADD_NODE, 'properties', 'labels');
export const addEdge = makeActionCreator(ADD_EDGE, 'source', 'label', 'target', 'properties');
export const removeNode = makeActionCreator(REMOVE_NODE, 'properties');
export const unlinkNode = makeActionCreator(UNLINK_NODE, 'properties');

const emptyGraph = {
  nodes: {},
  edges: {},
  edgeMap: {}
};

function createGraphReducer(config = { idPropertyName: 'id' }) {

  const getNodeId = (node) => {
    return node[config.idPropertyName];
  };

  return (state = emptyGraph, action) => {
    switch (action.type) {
      case ADD_NODE:
        return reduceAddNode();
      case ADD_EDGE:
        return reduceAddEdge();
      case REMOVE_NODE:
        return reduceRemoveNode();
      case UNLINK_NODE:
        return reduceUnlinkNode();
      default:
        return state; 
    }

    function reduceAddNode() {
      const nodeId = getNodeId(action.properties);
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [nodeId]: {
            id: nodeId,
            labels: typeof action.labels === 'string' ? [action.labels] : action.labels,
            properties: action.properties
          }
        }
      };
    }

    function reduceAddEdge() {
      const edgeId = uuid.v1();
      const sourceId = action.source[config.idPropertyName];
      const targetId = action.target[config.idPropertyName];
      return {
        ...state,
        edges: {
          ...state.edges,
          [edgeId]: {
            id: edgeId,
            source: { [config.idPropertyName] : sourceId },
            target: { [config.idPropertyName] : targetId },
            label: action.label,
            properties: action.properties
          }
        },
        edgeMap: getNewEdgeMap(state.edgeMap, edgeId, sourceId, targetId)
      };
    }

    function reduceRemoveNode() {
      const nodeId = action.properties[config.idPropertyName];
      return {
        ...state,
        ...unlinkNode(nodeId),
        nodes: _.omit(state.nodes, [nodeId])
      };
    }

    function reduceUnlinkNode() {
      const nodeId = action.properties[config.idPropertyName];
      return {
        ...state,
        ...unlinkNode(nodeId)
      };
    }

    function unlinkNode(nodeId) {
      return {
        edges: _.omit(
          state.edges,
          _.transform(state.edgeMap[nodeId], function(result, v, k) {
            v.forEach(edge => { result.push(edge); });
            return result;
          }, [])
        ),
        edgeMap: _.transform(state.edgeMap, function(result, v, k) {
          if (k === nodeId) {
            return result;
          } else if (nodeId in v) {
            const newEdges = _.omit(v, [nodeId]);
            if (Object.keys(newEdges).length) {
              result[k] = newEdges;
            }
            return result;
          }
          result[k] = v;
          return result;
        }, {})
      };
    }
  };
}

function getNewEdgeMap(currentMap, edgeId, sourceId, targetId) {
  return {
    ...currentMap,
    [sourceId]: {
      ...(currentMap[sourceId] || {}),
      [targetId]: [edgeId, ...((currentMap[sourceId] || {})[targetId] || [])]
    },
    [targetId]: {
      ...currentMap[targetId],
      [sourceId]: [edgeId, ...((currentMap[targetId] || {})[sourceId] || [])]
    }
  };
}

function makeActionCreator(type, ...argNames) {
  return (...args) => {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}
