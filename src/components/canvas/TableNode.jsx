import React, { useState, useRef } from 'react';

const TABLE_COLORS = {
  0: { header: '#1f6feb', bg: '#161b22', border: '#1f6feb' },
  1: { header: '#8b5cf6', bg: '#161b22', border: '#8b5cf6' },
  2: { header: '#f97316', bg: '#161b22', border: '#f97316' },
  3: { header: '#10b981', bg: '#161b22', border: '#10b981' },
  4: { header: '#ec4899', bg: '#161b22', border: '#ec4899' },
  5: { header: '#eab308', bg: '#161b22', border: '#eab308' },
  6: { header: '#06b6d4', bg: '#161b22', border: '#06b6d4' },
  7: { header: '#f43f5e', bg: '#161b22', border: '#f43f5e' },
};

export default function TableNode({ table, position, onPositionChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const colorIndex = table.colorIndex || 0;
  const colors = TABLE_COLORS[colorIndex % 8];

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEvent) => {
      onPositionChange({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute select-none"
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 50 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="rounded-lg overflow-hidden shadow-lg border"
        style={{
          borderColor: colors.border + '40',
          minWidth: '200px',
          background: colors.bg,
        }}
      >
        {/* Header */}
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{ background: colors.header + '20', borderBottom: `1px solid ${colors.border}30` }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: colors.header }} />
          <span className="text-xs font-bold text-white tracking-wide">{table.name}</span>
          {table.alias && (
            <span className="text-[10px] text-gray-500 font-mono ml-auto">{table.alias}</span>
          )}
        </div>

        {/* Columns */}
        <div className="py-1">
          {table.columns.map((col, i) => (
            <div
              key={i}
              className="px-3 py-1 flex items-center gap-2 text-[11px] hover:bg-[#21262d]/50"
            >
              {col.isKey && (
                <span className="text-amber-400 text-[9px] font-bold">PK</span>
              )}
              {col.isForeignKey && (
                <span className="text-blue-400 text-[9px] font-bold">FK</span>
              )}
              {!col.isKey && !col.isForeignKey && (
                <span className="w-4" />
              )}
              <span className="text-gray-300 font-mono">{col.name}</span>
              {col.type && (
                <span className="text-gray-600 font-mono ml-auto text-[10px]">{col.type}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}