import uuid from 'node-uuid';
import { ADD_NODE, ADD_EDGE, REMOVE_NODE, UNLINK_NODE, UNLINK_TWO } from './ActionTypes';

const _ = {
  transform: require('lodash.transform'),
  omit: require('lodash.omit')
};

module.exports = (config = { idPropertyName: 'id' }) => ({
  ...utilityFunctions(config),
  default: createGraphReducer(config)
});

const emptyGraph = {
  nodes: {},
  edges: {},
  edgeMap: {}
};

function createGraphReducer(config) {

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
      case UNLINK_TWO:
        return reduceUnlinkTwo();
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
      // TODO: prevent recreating edge list when node is not linked.
      return {
        edges: _.omit(
          state.edges,
          _.transform(state.edgeMap[nodeId], function(result, v, k) {
            v.forEach(edgeId => { result.push(edgeId); });
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

    function reduceUnlinkTwo() {
      const firstId = action.first[config.idPropertyName];
      const secondId = action.second[config.idPropertyName];
      return {
        ...state,
        ...unlinkTwo(firstId, secondId)
      }
    }

    function unlinkTwo(firstId, secondId) {
      // TODO: prevent recreating edge list when nodes are not linked.
      return {
        edges: _.omit(
          state.edges,
          _.transform(state.edgeMap[firstId], function(result, v, k) {
            v.forEach(edgeId => {
              const edge = state.edges[edgeId];
              const source = edge.source[config.idPropertyName];
              const target = edge.target[config.idPropertyName];
              if ((source === firstId && target === secondId)
                || (source === secondId && target === firstId)) {
                result.push(edgeId);
              }
            });
            return result;
          }, [])
        ),
        edgeMap: _.transform(state.edgeMap, function(result, v, k) {
          if (k === firstId && secondId in v) {
            const newEdges = _.omit(v, [secondId]);
            if (Object.keys(newEdges).length) {
              result[k] = newEdges;
            }
            return result;
          } else if (k === secondId && firstId in v) {
            const newEdges = _.omit(v, [firstId]);
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

function utilityFunctions(config) {
  const { idPropertyName } = config;

  return {
    getEdgesBetween,
    getEdgeWithLabelBetween
  };

  function getEdgeWithLabelBetween(graph, label, start, end) {
    const existingEdges = getEdgesBetween(graph, start, end);
    const filtered = existingEdges.filter(function(edge) {
      return edge.label === label;
    });
    if (filtered.length) {
      return filtered[0];
    }
    return null;
  }

  function getEdgesBetween(graph, start, end) {
    if (start[idPropertyName] in graph.edgeMap
        && end[idPropertyName] in graph.edgeMap[start[idPropertyName]]) {
      const edgeList = graph.edgeMap[start[idPropertyName]][end[idPropertyName]];
      return edgeList.map(function(edgeId) {
        return graph.edges[edgeId];
      });
    }
    return [];
  }
}
