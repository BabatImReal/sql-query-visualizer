import React from 'react';

const JOIN_COLORS = {
  'INNER JOIN': '#3b82f6',
  'LEFT JOIN': '#8b5cf6',
  'RIGHT JOIN': '#f97316',
  'FULL JOIN': '#10b981',
  'CROSS JOIN': '#f43f5e',
  'JOIN': '#3b82f6',
};

export default function JoinConnector({ join, fromPos, toPos, onClick, animated = true }) {
  if (!fromPos || !toPos) return null;

  const nodeWidth = 200;
  const nodeHeaderHeight = 36;

  const fromX = fromPos.x + nodeWidth;
  const fromY = fromPos.y + nodeHeaderHeight;
  const toX = toPos.x;
  const toY = toPos.y + nodeHeaderHeight;

  // Determine if we need to flip the direction
  const dx = toX - fromX;
  const startX = dx >= 0 ? fromX : fromPos.x;
  const endX = dx >= 0 ? toX : toPos.x + nodeWidth;
  const midX = (startX + endX) / 2;

  const color = JOIN_COLORS[join.type] || '#3b82f6';

  const path = `M ${startX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${endX} ${toY}`;

  return (
    <g onClick={() => onClick && onClick(join)} className="cursor-pointer" style={{ pointerEvents: 'all' }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={join.type === 'LEFT JOIN' || join.type === 'RIGHT JOIN' ? '4,4' : 'none'}
        opacity={0.6}
        className={`hover:opacity-100 transition-opacity ${animated ? 'animate-[dash_4s_linear_infinite]' : ''}`}
      />
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
      />
      {/* Arrow head */}
      <circle cx={endX} cy={toY} r="3" fill={color} opacity={0.8} />
      {/* Join label */}
      <rect
        x={midX - 35}
        y={(fromY + toY) / 2 - 9}
        width="70"
        height="18"
        rx="4"
        fill="#161b22"
        stroke={color}
        strokeWidth="0.5"
        opacity={0.9}
      />
      <text
        x={midX}
        y={(fromY + toY) / 2 + 3}
        textAnchor="middle"
        fill={color}
        fontSize="8"
        fontFamily="ui-monospace, monospace"
        fontWeight="600"
      >
        {join.type}
      </text>
    </g>
  );
}