import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from collections import defaultdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    nodeType: str
    label: str
    params: Dict[str, Any]

class Edge(BaseModel):
    from_: str = Field(alias="from")
    to: str

class GraphRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.post("/convert/pytorch")
async def convert_pytorch(request: GraphRequest):
    edges = request.edges
    nodes = request.nodes
    has_start = any(edge.from_ == "start" for edge in edges)
    has_end = any(edge.to == "end" for edge in edges)
    
    valid = has_start and has_end

    if not valid:
        return {"error": "Incomplete model"}

    edges_dict = defaultdict(list)

    lines = [
        "import torch.nn as nn",
        "",
        "class Model(nn.Module):",
        "\tdef __init__(self):",
        "\t\tsuper().__init__()"
    ]

    all_kvs = []     

    for edge in edges:
        from_ = edge.from_
        to = edge.to
        edges_dict[from_].append(to)
        all_kvs.append(from_)
        all_kvs.append(to)

    all_kvs = list(set(all_kvs))
    all_kvs.remove('start')
    all_kvs.remove('end')

    nodes_dict = {}

    for node in nodes:
        nodes_dict[node.id] = {"nodeType": node.nodeType, "label": node.label, "params": node.params}

    for key in all_kvs:
        node = nodes_dict[key]
        if node['nodeType'].lower() == 'linear':
            lines.append(f"\t\tself.{node['label']} = nn.Linear({node['params']['input']}, {node['params']['output']})")
        else:
            return {"error": "Unknown node type"}

    lines.append("")
    lines.append("\tdef forward(self, x):")

    curr = edges_dict['start']

    while curr:
        node = nodes_dict[curr[0]]
        lines.append(f"\t\tx = self.{node['label']}(x)")
        curr = edges_dict[curr[0]]
        if curr[0].lower() == "end":
            curr = None

    lines.append("\t\treturn x")

    code = "\n".join(lines)
    return {"code": code, "success": True}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="localhost",
        port=8000
    )
