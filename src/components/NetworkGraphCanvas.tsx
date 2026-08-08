import React, { useRef, useEffect, useState } from 'react';
import {
  ComputerNode,
  NetworkEdge,
  NetworkType,
  Department,
} from '../types/simulation';
import { Eye, EyeOff, Shield, AlertTriangle, Skull, CheckCircle } from 'lucide-react';

interface NetworkGraphCanvasProps {
  nodes: ComputerNode[];
  edges: NetworkEdge[];
  networkType: NetworkType;
  initialCompromisedId: number | null;
  newlyCompromisedIds: number[];
  currentStep: number;
}

const DEPT_LABELS: Record<string, { title: string; color: string; bg: string }> = {
  HR: { title: 'Human Resources (HR)', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' },
  Finance: { title: 'Finance Dept', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  IT: { title: 'Information Technology (IT)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  Engineering: { title: 'Engineering & Dev', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
};

export const NetworkGraphCanvas: React.FC<NetworkGraphCanvasProps> = ({
  nodes,
  edges,
  networkType,
  initialCompromisedId,
  newlyCompromisedIds,
  currentStep,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<ComputerNode | null>(null);

  // Responsive canvas resizing and drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Segmented Department Background Clusters & Titles
      if (networkType === 'segmented') {
        const quadrants = [
          { dept: 'HR', x: 20, y: 20, w: width / 2 - 30, h: height / 2 - 30 },
          { dept: 'Finance', x: width / 2 + 10, y: 20, w: width / 2 - 30, h: height / 2 - 30 },
          { dept: 'IT', x: 20, y: height / 2 + 10, w: width / 2 - 30, h: height / 2 - 30 },
          {
            dept: 'Engineering',
            x: width / 2 + 10,
            y: height / 2 + 10,
            w: width / 2 - 30,
            h: height / 2 - 30,
          },
        ];

        quadrants.forEach((q) => {
          const info = DEPT_LABELS[q.dept];
          if (!info) return;

          ctx.save();
          ctx.fillStyle = info.bg;
          ctx.strokeStyle = info.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);

          // Draw rounded box
          ctx.beginPath();
          ctx.roundRect(q.x, q.y, q.w, q.h, 16);
          ctx.fill();
          ctx.stroke();

          // Department Label header
          ctx.fillStyle = info.color;
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(info.title, q.x + 16, q.y + 24);

          ctx.restore();
        });
      }

      // Draw Edges
      edges.forEach((edge) => {
        const sourceNode = nodes[edge.source];
        const targetNode = nodes[edge.target];
        if (!sourceNode || !targetNode) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);

        if (edge.isCrossDepartment) {
          // Distinct cross-department edge styling
          ctx.strokeStyle = '#c084fc'; // Neon purple
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 3]);
        } else {
          // Regular intra-department or flat network edge
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)'; // Slate edge
          ctx.lineWidth = 1.2;
        }

        ctx.stroke();
        ctx.restore();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isInitial = node.id === initialCompromisedId;
        const isNewlyCompromised = newlyCompromisedIds.includes(node.id);

        ctx.save();

        // Node Color & Stroke based on State
        let fillColor = '#64748b'; // Gray default
        let strokeColor = '#94a3b8';
        let radius = 7.5;

        if (node.state === 'vulnerable') {
          fillColor = '#f97316'; // Orange
          strokeColor = '#ea580c';
        } else if (node.state === 'patched') {
          fillColor = '#3b82f6'; // Blue
          strokeColor = '#2563eb';
        } else if (node.state === 'compromised') {
          fillColor = '#ef4444'; // Red
          strokeColor = '#dc2626';
          radius = 8.5;
        } else if (node.state === 'safe') {
          fillColor = '#10b981'; // Green
          strokeColor = '#059669';
        }

        // Temporary highlight pulse for newly compromised computers
        if (isNewlyCompromised) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 14, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Highlight Patient 0 (Initially Compromised Computer)
        if (isInitial) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#eab308'; // Golden target ring
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Draw main node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // Draw icon/symbol inside or badge above node so we don't rely only on color
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (node.state === 'patched') {
          ctx.fillText('✓', node.x, node.y + 0.5);
        } else if (node.state === 'vulnerable') {
          ctx.fillText('!', node.x, node.y + 0.5);
        } else if (node.state === 'compromised') {
          ctx.fillText('✕', node.x, node.y + 0.5);
        }

        // Draw labels if showLabels is true OR if it is Patient 0
        if (showLabels || isInitial || isNewlyCompromised) {
          ctx.font = isInitial ? 'bold 11px sans-serif' : '10px sans-serif';
          ctx.fillStyle = isInitial ? '#fef08a' : '#e2e8f0';
          const labelText = isInitial ? `${node.label} (Patient 0)` : node.label;

          // Background box for label readability
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(
            node.x - textWidth / 2 - 3,
            node.y - radius - 18,
            textWidth + 6,
            14
          );

          ctx.fillStyle = isInitial ? '#fef08a' : '#e2e8f0';
          ctx.fillText(labelText, node.x, node.y - radius - 11);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, networkType, initialCompromisedId, newlyCompromisedIds, showLabels]);

  // Handle canvas click/move to inspect node details
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Find nearest node within 15px radius
    let found: ComputerNode | null = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) <= 15) {
        found = node;
        break;
      }
    }

    setHoveredNode(found);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative shadow-inner">
      {/* Top Bar Controls inside Graph Canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-200">
            {networkType === 'flat'
              ? 'Flat Office Network Topology'
              : 'Segmented Enterprise Network Topology'}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showLabels
                ? 'bg-blue-900/50 text-blue-300 border-blue-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
        </div>
      </div>

      {/* Canvas Element */}
      <div className="relative flex justify-center bg-slate-900/40 rounded-lg border border-slate-800/80 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          className="w-full max-w-[700px] aspect-square cursor-crosshair"
        />

        {/* Hovered Node Tooltip */}
        {hoveredNode && (
          <div
            className="absolute bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 shadow-xl z-20 max-w-xs animate-in fade-in"
          >
            <div className="font-bold text-white text-sm mb-1">
              {hoveredNode.label}
              {hoveredNode.id === initialCompromisedId && (
                <span className="ml-1 text-xs text-amber-400">★ Patient 0</span>
              )}
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-slate-400">Department:</span>{' '}
                <span className="font-semibold text-slate-200">
                  {hoveredNode.department}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <span
                  className={`font-semibold capitalize ${
                    hoveredNode.state === 'compromised'
                      ? 'text-red-400'
                      : hoveredNode.state === 'patched'
                      ? 'text-blue-400'
                      : 'text-orange-400'
                  }`}
                >
                  {hoveredNode.state}
                </span>
              </div>
              {hoveredNode.compromiseStep !== null && (
                <div>
                  <span className="text-slate-400">Compromised Step:</span>{' '}
                  <span className="font-mono text-red-300">
                    Step {hoveredNode.compromiseStep}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400">Connections:</span>{' '}
                <span className="font-mono text-slate-300">
                  {hoveredNode.connections.length} neighbors
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Visual Legend (No color-only reliance!) */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-400 flex items-center justify-center text-[8px] font-bold text-white">
              !
            </span>
            <span>Vulnerable (Not Patched)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-400 flex items-center justify-center text-[8px] font-bold text-white">
              ✓
            </span>
            <span>Patched (Protected)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-400 flex items-center justify-center text-[8px] font-bold text-white">
              ✕
            </span>
            <span>Compromised</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-400 flex items-center justify-center text-[8px] font-bold text-white">
              ✓
            </span>
            <span>Safe / Unaffected</span>
          </div>
        </div>

        {networkType === 'segmented' && (
          <div className="flex items-center gap-1.5">
            <span className="w-6 border-b-2 border-dashed border-purple-400 inline-block"></span>
            <span className="text-purple-300 font-semibold">
              Cross-Department Connection
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
