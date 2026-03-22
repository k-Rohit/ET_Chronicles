import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ConnectionGraph } from '@/services/api';

const NODE_COLORS: Record<string, string> = {
  person: '#38bdf8',   // sky
  org: '#a78bfa',      // violet
  topic: '#34d399',    // emerald
  event: '#fbbf24',    // amber
  policy: '#f87171',   // red
};

interface NewsGraphProps {
  graph: ConnectionGraph;
}

const NewsGraph = ({ graph }: NewsGraphProps) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    // Arrange nodes in a circle
    const cx = 300, cy = 200, radius = 160;
    const nodes: Node[] = graph.nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
      const nodeSize = 20 + n.size * 12;
      return {
        id: n.id,
        position: {
          x: cx + radius * Math.cos(angle) * (0.6 + n.size * 0.1) - nodeSize / 2,
          y: cy + radius * Math.sin(angle) * (0.6 + n.size * 0.1) - nodeSize / 2,
        },
        data: { label: n.label },
        style: {
          background: NODE_COLORS[n.type] || '#64748b',
          color: '#0f172a',
          border: 'none',
          borderRadius: '50%',
          width: nodeSize,
          height: nodeSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: n.size >= 4 ? '11px' : '9px',
          fontWeight: n.size >= 4 ? 700 : 500,
          padding: '4px',
          textAlign: 'center' as const,
          lineHeight: '1.1',
          boxShadow: `0 0 ${n.size * 4}px ${NODE_COLORS[n.type] || '#64748b'}40`,
        },
        draggable: true,
      };
    });

    const edges: Edge[] = graph.edges.map((e, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.strength >= 3,
      style: {
        stroke: '#475569',
        strokeWidth: e.strength,
        opacity: 0.4 + e.strength * 0.2,
      },
      labelStyle: {
        fontSize: 8,
        fill: '#94a3b8',
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: '#0f172a',
        fillOpacity: 0.8,
      },
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#475569' },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [graph]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden glass-panel">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        panOnDrag
        zoomOnScroll
      >
        <Background color="#1e293b" gap={20} size={1} />
      </ReactFlow>
      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-border">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[9px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsGraph;
