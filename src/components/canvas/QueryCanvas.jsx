import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableNode from './TableNode';
import JoinConnector from './JoinConnector';

export default function QueryCanvas({ tables, joins, isLoading, onJoinClick }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const containerRef = useRef(null);

  // Calculate initial positions in a grid layout
  useEffect(() => {
    if (!tables || tables.length === 0) return;
    const positions = {};
    const cols = Math.ceil(Math.sqrt(tables.length));
    const spacingX = 280;
    const spacingY = 240;
    tables.forEach((table, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions[table.name] = {
        x: 60 + col * spacingX,
        y: 40 + row * spacingY,
      };
    });
    setNodePositions(positions);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [tables]);

  const updateNodePosition = useCallback((name, pos) => {
    setNodePositions(prev => ({ ...prev, [name]: pos }));
  }, []);

  const handleMouseDown = (e) => {
    if (e.target === containerRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.3));
  const handleFit = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d1117]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm text-gray-400">Analyzing query...</span>
        </div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <line x1="10" y1="6.5" x2="14" y2="6.5" />
              <line x1="6.5" y1="10" x2="6.5" y2="14" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">No visualization yet</p>
          <p className="text-xs text-gray-600">Write a SQL query and click Visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Query Diagram</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" onClick={handleZoomOut}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-gray-500 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" onClick={handleZoomIn}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" onClick={handleFit}>
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#21262d" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Connectors (SVG) */}
          <svg className="absolute top-0 left-0" style={{ width: '2000px', height: '2000px' }}>
            {joins.map((join, i) => (
              <JoinConnector
                key={i}
                join={join}
                fromPos={nodePositions[join.from]}
                toPos={nodePositions[join.to]}
                onClick={onJoinClick}
              />
            ))}
          </svg>

          {/* Table nodes */}
          {tables.map(table => (
            <TableNode
              key={table.name}
              table={table}
              position={nodePositions[table.name] || { x: 0, y: 0 }}
              onPositionChange={(pos) => updateNodePosition(table.name, pos)}
            />
          ))}
        </div>
      </div>

      <div className="px-3 py-1.5 border-t border-[#21262d] bg-[#161b22] flex items-center gap-4">
        <span className="text-[10px] text-gray-500">{tables.length} tables</span>
        <span className="text-[10px] text-gray-500">{joins.length} joins</span>
      </div>
    </div>
  );
}