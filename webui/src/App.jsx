import { useState } from 'react'
import './App.css'
import DraggableNode from './DraggableNode.jsx'

function App() {
  const [Nodes, setNodes] = useState(["150x150", "200x200", "300x300"]);

  return (
    <>
      <div>
        {Nodes.map((node) => (
          <DraggableNode size={node}>
          </DraggableNode>
        ))}
      </div>
    </>
  )
}

export default App
