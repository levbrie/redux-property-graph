import { expect } from 'chai';
import { addNode, addEdge, modifyNode, removeNode, unlinkNode, unlinkTwo } from '../src/ActionCreators';

const { default: graphReducer, getEdgeWithLabelBetween } = require('../src')({ idPropertyName: 'id' });

const objectValues = (obj) => {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
}

const initialState = Object.freeze({
  nodes: {},
  edges: {},
  edgeMap: {}
});

const stateWithOneNode = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    }
  },
  edges: {},
  edgeMap: {}
});

const stateWithTwoNodes = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    },
    '2': {
      id: '2',
      labels: ['Person'],
      properties: {
        id: '2',
        name: 'Lev'
      }
    }
  },
  edges: {},
  edgeMap: {}
});

const stateWithTwoNodesAndOneEdge = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    },
    '2': {
      id: '2',
      labels: ['Person'],
      properties: {
        id: '2',
        name: 'Lev'
      }
    }
  },
  edges: {
    'edge1': {
      id: 'edge1',
      source: { id: '1' },
      target: { id: '2' },
      label: 'KNOWS',
      properties: {
        since: 2015
      }
    }
  },
  edgeMap: {
    '1': { '2': ['edge1'] },
    '2': { '1': ['edge1'] }
  }
});

const stateWithTwoNodesAndTwoEdges = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    },
    '2': {
      id: '2',
      labels: ['Person'],
      properties: {
        id: '2',
        name: 'Lev'
      }
    }
  },
  edges: {
    'edge1': {
      id: 'edge1',
      source: { id: '1' },
      target: { id: '2' },
      label: 'KNOWS',
      properties: {
        since: 2015
      }
    },
    'edge2': {
      id: 'edge2',
      source: { id: '1' },
      target: { id: '2' },
      label: 'WORKS_WITH',
      properties: {
        since: 2015
      }
    }
  },
  edgeMap: {
    '1': { '2': ['edge1', 'edge2'] },
    '2': { '1': ['edge1', 'edge2'] }
  }
});

const stateWithThreeNodesAndOneEdge = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    },
    '2': {
      id: '2',
      labels: ['Person'],
      properties: {
        id: '2',
        name: 'Lev'
      }
    },
    '3': {
      id: '3',
      labels: ['Person'],
      properties: {
        id: '3',
        name: 'Steven'
      }
    }
  },
  edges: {
    'edge1': {
      id: 'edge1',
      source: { id: '1' },
      target: { id: '2' },
      label: 'KNOWS',
      properties: {
        since: 2015
      }
    }
  },
  edgeMap: {
    '1': { '2': ['edge1'] },
    '2': { '1': ['edge1'] }
  }
});

const stateWithThreeNodesAndTwoEdges = Object.freeze({
  nodes: {
    '1': {
      id: '1',
      labels: ['Person'],
      properties: {
        id: '1',
        name: 'Sam'
      }
    },
    '2': {
      id: '2',
      labels: ['Person'],
      properties: {
        id: '2',
        name: 'Lev'
      }
    },
    '3': {
      id: '3',
      labels: ['Person'],
      properties: {
        id: '3',
        name: 'Steven'
      }
    }
  },
  edges: {
    'edge1': {
      id: 'edge1',
      source: { id: '1' },
      target: { id: '2' },
      label: 'KNOWS',
      properties: {
        since: 2015
      }
    },
    'edge2': {
      id: 'edge2',
      source: { id: '2' },
      target: { id: '3' },
      label: 'KNOWS',
      properties: {
        since: 2015
      }
    }
  },
  edgeMap: {
    '1': { '2': ['edge1'] },
    '2': { '1': ['edge1'], '3': ['edge2'] },
    '3': { '2': ['edge2'] }
  }
});

describe('reducer', () => {

  it('should handle initial state', () => {
    expect(graphReducer(undefined, {}))
      .to.deep.equal(initialState);
  });

  it('should handle addNode by adding a node', () => {
    expect(graphReducer(initialState, addNode({ id: '1', name: 'Sam' }, 'Person')))
    .to.deep.equal(stateWithOneNode);
  });

  it('should handle addEdge by creating edge between existing nodes', () => {
    const action = addEdge({ id: '1' }, 'KNOWS', { id: '2' }, { since: 2015 });
    const newState = graphReducer(stateWithTwoNodes, action);
    const newEdge = objectValues(newState.edges)[0];
    const expectedEdge = stateWithTwoNodesAndOneEdge.edges['edge1'];
    expect(newEdge.properties).to.deep.equal(expectedEdge.properties);
    expect(newEdge.label).to.equal(expectedEdge.label);
    expect(newEdge.source).to.deep.equal(expectedEdge.source);
    expect(newEdge.target).to.deep.equal(expectedEdge.target);
    expect(newState.edgeMap).to.deep.equal({
      '1': { '2': [newEdge.id] },
      '2': { '1': [newEdge.id] }
    });
  });

  it('should handle adding a second edge between existing nodes', () => {
    const action = addEdge({ id: '1' }, 'WORKS_WITH', { id: '2' }, { since: 2015 });
    const newState = graphReducer(stateWithTwoNodesAndOneEdge, action);
    const oldEdge = objectValues(newState.edges).filter(edge => edge.label === 'KNOWS')[0];
    const newEdge = objectValues(newState.edges).filter(edge => edge.label === 'WORKS_WITH')[0];
    const expectedEdge = stateWithTwoNodesAndTwoEdges.edges['edge2'];
    expect(newEdge.properties).to.deep.equal(expectedEdge.properties);
    expect(newEdge.label).to.equal(expectedEdge.label);
    expect(newEdge.source).to.deep.equal(expectedEdge.source);
    expect(newEdge.target).to.deep.equal(expectedEdge.target);
    expect(newState.edgeMap).to.deep.equal({
      '1': { '2': [newEdge.id, oldEdge.id] },
      '2': { '1': [newEdge.id, oldEdge.id] }
    });
  });

  it('should handle modifyNode', () => {
    expect(graphReducer(stateWithOneNode, modifyNode({ id: '1', name: 'Samurdha' }, 'Human')))
    .to.deep.equal({
      nodes: {
        '1': {
          id: '1',
          labels: ['Human'],
          properties: {
            id: '1',
            name: 'Samurdha'
          }
        }
      },
      edges: {},
      edgeMap: {}
    });
  });

  it('should handle removeNode by removing a node', () => {
    expect(graphReducer(stateWithTwoNodes, removeNode({ id: '2' })))
    .to.deep.equal(stateWithOneNode);
  });

  it('should remove edges when removing a node', () => {
    expect(graphReducer(stateWithThreeNodesAndTwoEdges, removeNode({ id: '3' })))
    .to.deep.equal(stateWithTwoNodesAndOneEdge);
  });

  it('should handle unlinkNode by removing edges', () => {
    expect(graphReducer(stateWithTwoNodesAndTwoEdges, unlinkNode({ id: '1' })))
    .to.deep.equal(stateWithTwoNodes);
  });

  it('should handle unlinkTwo by removing edges between two nodes', () => {
    expect(graphReducer(stateWithThreeNodesAndTwoEdges, unlinkTwo({ id: '2' }, { id: '3' })))
    .to.deep.equal(stateWithThreeNodesAndOneEdge);
  });

});

describe('getEdgeWithLabelBetween', () => {

  it('should return edge', () => {
    expect(getEdgeWithLabelBetween(stateWithTwoNodesAndTwoEdges, 'KNOWS', { id: '1' }, { id: '2' }))
    .to.equal(stateWithTwoNodesAndTwoEdges.edges['edge1']);
  });

});