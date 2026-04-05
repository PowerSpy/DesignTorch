import { useCallback, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'
import LayerNode from './LayerNode.jsx'

const nodeTypes = { dimension: LayerNode }

const initialNodes = [
  { id: 'start', type: 'dimension', position: { x: 100, y: 50 }, data: { nodeType: "start", label: 'Start' } },
  { id: 'end',   type: 'dimension', position: { x: 600, y: 250 }, data: { nodeType: "end", label: 'End' } },
]

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [query, setQuery] = useState("")
  const [nodeIndex, setNodeIndex] = useState(0)

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

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
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#378ADD'} }, eds)),
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

  async function convertToPytorch() {
    const graph = exportNodes()
    const response = await fetch('http://localhost:8000/convert/pytorch', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        nodes: graph.nodes,
        edges: graph.edges
      }),
    })
    const data = await response.json()
    if (data.success && data.code) {
      try {
        await navigator.clipboard.writeText(data.code)
      } catch (err) {
        console.error('Failed to copy:', err)
        const blob = new Blob([data.code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'model.py'
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  const nodeTypesList = ["linear", "start", "end"]

  function searchForNode(query) {
    if (!query) return nodeTypesList
    return nodeTypesList.filter(type =>
      type.toLowerCase().includes(query.toLowerCase())
    )
  }

  function handleMenuToggle() {
    if (menuIsOpen) {
      setIsExiting(true)
      setTimeout(() => {
        setMenuIsOpen(false)
        setIsExiting(false)
        setQuery("")
      }, 250)
    } else {
      setMenuIsOpen(true)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <button
        onClick={handleMenuToggle}
        className="add-node-btn"
      >
        Add Node
      </button>
      <button
        onClick={convertToPytorch}
        className="export-btn"
      >
        Export Nodes
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
       {menuIsOpen && (
        <>
          <div className={`menu-backdrop ${isExiting ? 'exiting' : ''}`} onClick={handleMenuToggle}></div>
          <div className={`node-selection-menu ${isExiting ? 'exiting' : ''}`}>
            <input
              type="text"
              placeholder="Search node types..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul>
              {searchForNode(query).map((type) => (
                <li
                  key={type}
                  onClick={() => { // Create a function for this later to prevent duplicate unnecesary code
                    const newNode = {
                      id: `node-${nodeIndex}`,
                      type: 'dimension',
                      position: { x: 400, y: 200 },
                      data: { nodeType: type, label: `node-${nodeIndex}`, input: 100, output: 100 } // Create a way to modify the input/output/label
                    }
                    setNodeIndex(nodeIndex + 1)
                    setNodes((nds) => [...nds, newNode])
                    handleMenuToggle()
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const newNode = {
                        id: `node-${nodeIndex}`,
                        type: 'dimension',
                        position: { x: 400, y: 200 },
                        data: { nodeType: type, label: `node-${nodeIndex}`, input: 100, output: 100 }
                      }
                      setNodeIndex(nodeIndex + 1)
                      setNodes((nds) => [...nds, newNode])
                      handleMenuToggle()
                    }
                  }}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      </ReactFlow>
    </div>
  )
}