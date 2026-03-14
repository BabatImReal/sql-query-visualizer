import React from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

function StatCard({ label, value, icon: Icon, color, warning }) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${warning ? 'bg-amber-900/10 border-amber-900/20' : 'bg-[#161b22] border-[#21262d]'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default function QueryStats({ stats }) {
  if (!stats) return null;

  const hasIssues = stats.warnings && stats.warnings.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Query Analysis</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Tables"
              value={stats.tableCount || 0}
              icon={Info}
              color="#3b82f6"
            />
            <StatCard
              label="Joins"
              value={stats.joinCount || 0}
              icon={TrendingUp}
              color="#8b5cf6"
            />
            <StatCard
              label="Complexity"
              value={stats.complexity || 'Low'}
              icon={stats.complexity === 'High' ? AlertTriangle : CheckCircle}
              color={stats.complexity === 'High' ? '#f97316' : '#10b981'}
              warning={stats.complexity === 'High'}
            />
            <StatCard
              label="Filters"
              value={stats.filterCount || 0}
              icon={Info}
              color="#06b6d4"
            />
          </div>

          {/* Issues Section */}
          {hasIssues && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Issues Detected
              </h4>
              {stats.warnings.map((warning, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-amber-900/10 border border-amber-900/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-200">{warning.type}</p>
                      <p className="text-[11px] text-amber-300/70 mt-0.5">{warning.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Tips */}
          {stats.performanceTips && stats.performanceTips.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Performance Tips
              </h4>
              {stats.performanceTips.map((tip, i) => (
                <div key={i} className="px-3 py-2 rounded-lg bg-blue-900/10 border border-blue-900/20">
                  <p className="text-[11px] text-blue-200/80">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* Good Practices */}
          {stats.goodPractices && stats.goodPractices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Good Practices
              </h4>
              {stats.goodPractices.map((practice, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-green-300/70">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  {practice}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}