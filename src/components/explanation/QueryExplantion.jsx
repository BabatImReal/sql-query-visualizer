import React from 'react';
import { Info, Lightbulb, GitBranch, Table2, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{title}</span>
      </div>
      <div className="pl-5 space-y-1.5">{children}</div>
    </div>
  );
}

export default function QueryExplanation({ explanation, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-xs text-gray-400">Generating explanation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Explanation</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <Info className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-xs text-gray-500">Visualize a query to see its explanation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Explanation</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Summary */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d] mb-4">
            <p className="text-xs text-gray-300 leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Tables */}
          {explanation.tables && explanation.tables.length > 0 && (
            <Section icon={Table2} title="Tables Used" color="#3b82f6">
              {explanation.tables.map((t, i) => (
                <div key={i} className="text-[11px] text-gray-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-gray-300 font-mono">{t.name}</span>
                  {t.alias && <span className="text-gray-600">as {t.alias}</span>}
                  {t.purpose && <span className="text-gray-500">— {t.purpose}</span>}
                </div>
              ))}
            </Section>
          )}

          {/* Joins */}
          {explanation.joins && explanation.joins.length > 0 && (
            <Section icon={GitBranch} title="Join Relationships" color="#8b5cf6">
              {explanation.joins.map((j, i) => (
                <div key={i} className="text-[11px] bg-[#161b22] rounded p-2 border border-[#21262d]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-purple-400 font-mono font-semibold">{j.type}</span>
                  </div>
                  <p className="text-gray-400">{j.explanation}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Filters */}
          {explanation.filters && explanation.filters.length > 0 && (
            <Section icon={Filter} title="Filters" color="#f97316">
              {explanation.filters.map((f, i) => (
                <div key={i} className="text-[11px] text-gray-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Ordering */}
          {explanation.ordering && (
            <Section icon={ArrowUpDown} title="Ordering" color="#10b981">
              <p className="text-[11px] text-gray-400">{explanation.ordering}</p>
            </Section>
          )}

          {/* Optimization */}
          {explanation.optimizations && explanation.optimizations.length > 0 && (
            <Section icon={Lightbulb} title="Optimization Tips" color="#eab308">
              {explanation.optimizations.map((opt, i) => (
                <div key={i} className="text-[11px] bg-amber-900/10 border border-amber-900/20 rounded p-2">
                  <p className="text-amber-200/80">{opt}</p>
                </div>
              ))}
            </Section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}   