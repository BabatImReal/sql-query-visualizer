import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GitBranch, ArrowRight } from 'lucide-react';

const JOIN_TYPE_INFO = {
  'INNER JOIN': {
    color: '#3b82f6',
    description: 'Returns only rows where there is a match in both tables',
    example: 'Only customers who have placed orders',
  },
  'LEFT JOIN': {
    color: '#8b5cf6',
    description: 'Returns all rows from the left table and matching rows from the right',
    example: 'All customers, even those without orders',
  },
  'RIGHT JOIN': {
    color: '#f97316',
    description: 'Returns all rows from the right table and matching rows from the left',
    example: 'All orders, even those without valid customers',
  },
  'FULL JOIN': {
    color: '#10b981',
    description: 'Returns all rows when there is a match in either table',
    example: 'All customers and all orders, matching where possible',
  },
  'CROSS JOIN': {
    color: '#f43f5e',
    description: 'Returns the Cartesian product of both tables',
    example: 'Every customer paired with every order',
  },
  'JOIN': {
    color: '#3b82f6',
    description: 'Default join (same as INNER JOIN)',
    example: 'Only matching rows between tables',
  },
};

export default function JoinDetailModal({ join, isOpen, onClose }) {
  if (!join) return null;

  const typeInfo = JOIN_TYPE_INFO[join.type] || JOIN_TYPE_INFO['JOIN'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <GitBranch className="w-4 h-4" style={{ color: typeInfo.color }} />
            Join Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Join Type */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Join Type</label>
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm font-semibold"
              style={{ background: typeInfo.color + '20', color: typeInfo.color }}
            >
              {join.type}
            </div>
          </div>

          {/* Tables */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Tables</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded bg-[#0d1117] border border-[#21262d]">
                <span className="text-xs text-gray-500">FROM</span>
                <p className="font-mono text-sm text-white">{join.from}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="flex-1 px-3 py-2 rounded bg-[#0d1117] border border-[#21262d]">
                <span className="text-xs text-gray-500">TO</span>
                <p className="font-mono text-sm text-white">{join.to}</p>
              </div>
            </div>
          </div>

          {/* Condition */}
          {join.condition && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Condition</label>
              <div className="px-3 py-2 rounded bg-[#0d1117] border border-[#21262d] font-mono text-xs text-gray-300">
                {join.condition}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-[#21262d] bg-[#0d1117] p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-1">What this join does</h4>
            <p className="text-xs text-gray-500 mb-2">{typeInfo.description}</p>
            <div className="text-xs text-gray-600">
              <span className="text-gray-500">Example:</span> {typeInfo.example}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}