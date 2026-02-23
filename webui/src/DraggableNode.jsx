import Draggable from 'react-draggable'
import { useRef } from 'react'
import './DraggableNode.css'

function DraggableNode({ size }) {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="node">
        Dims: {size}
      </div>
    </Draggable>
  )
}

export default DraggableNode