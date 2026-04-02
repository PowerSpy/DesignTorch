import { Handle, Position } from '@xyflow/react'
import './LayerNode.css'

function LayerNode({ data }) {
  const content = data.label ?? `${data.input} x ${data.output}`
  return (
    <div className={"node ${data.nodeType}"}>
      {data.nodeType !== 'start' && <Handle type="target" position={Position.Left} />}
      {content}
      {data.nodeType !== 'end' && <Handle type="source" position={Position.Right} />}
    </div>
  )
}

export default LayerNode