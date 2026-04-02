import { useCallback } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import LayerNode from './LayerNode.jsx'

const nodeTypes = { dimension: LayerNode }

const initialNodes = [
  { id: 'a', type: 'dimension', position: { x: 100, y: 100 }, data: { nodeType: "linear", label: "layer1", input: 150, output: 150 } },
  { id: 'b', type: 'dimension', position: { x: 300, y: 200 }, data: { nodeType: "linear", label: "layer2", input: 200, output: 200 } },
  { id: 'c', type: 'dimension', position: { x: 500, y: 100 }, data: { nodeType: "linear", label: "layer3", input: 300, output: 300 } },
  { id: 'start', type: 'dimension', position: { x: 100, y: 50 }, data: { nodeType: "start", label: 'Start' } },
  { id: 'end',   type: 'dimension', position: { x: 600, y: 250 }, data: { nodeType: "end", label: 'End' } },
]

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const handleNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds)
        return updatedNodes.map((node) => {
          const originalNode = nds.find((n) => n.id === node.id)
          if (originalNode && originalNode.data) {
            return { ...node, data: originalNode.data }
          }
          return node
        })
      })
    },
    [setNodes]
  )

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, style: { stroke: '#378ADD' } }, eds)),
    [setEdges]
  )

  function exportNodes() {
    const graph = {
      nodes: nodes.map(n => ({
        id: n.id,
        nodeType: n.data.nodeType,
        label: n.data.label,
        params: {
          input: n.data.input,
          output: n.data.output
        }
      })),
      edges: edges.map(e => ({
        from: e.source,
        to: e.target
      }))
    }

    return graph
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  )
}