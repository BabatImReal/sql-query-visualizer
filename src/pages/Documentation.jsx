import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Zap, Table2, GitBranch, Download, Save, Lightbulb } from 'lucide-react';

const sections = [
  {
    icon: Zap,
    title: 'Getting Started',
    color: '#3b82f6',
    content: [
      'Paste or write your SQL query in the editor on the left panel.',
      'Click "Visualize" or press Cmd/Ctrl+Enter to generate a diagram.',
      'The center panel shows an interactive diagram of table relationships.',
      'Switch between "Explanation" and "Analysis" tabs in the right panel.',
      'Use "Templates" to load pre-built example queries.',
    ],
  },
  {
    icon: Table2,
    title: 'Query Visualization',
    color: '#8b5cf6',
    content: [
      'Tables appear as colored nodes showing their columns.',
      'Primary keys are marked with PK, foreign keys with FK.',
      'Drag table nodes to rearrange the diagram.',
      'Use zoom controls or scroll to navigate large diagrams.',
    ],
  },
  {
    icon: GitBranch,
    title: 'Understanding Joins',
    color: '#10b981',
    content: [
      'INNER JOIN connections are shown with solid blue lines.',
      'LEFT/RIGHT JOINs appear with dashed purple/orange lines.',
      'Click on any join connector to see detailed join information.',
      'View join conditions, table relationships, and join explanations.',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Query Analysis',
    color: '#eab308',
    content: [
      'Switch to the "Analysis" tab to see query complexity metrics.',
      'View warnings for potential issues like Cartesian joins or unused tables.',
      'Get specific performance optimization tips.',
      'See which SQL best practices your query follows.',
    ],
  },
  {
    icon: Save,
    title: 'Productivity Features',
    color: '#f97316',
    content: [
      'Save queries with Cmd/Ctrl+S or the Save button.',
      'Browse query history to reload recent visualizations.',
      'Use keyboard shortcuts for faster workflow (press ? to view all).',
      'Format SQL with the magic wand button for clean, readable code.',
      'Share queries via link using the Share button.',
    ],
  },
  {
    icon: Download,
    title: 'Export & Share',
    color: '#ec4899',
    content: [
      'Export diagrams as high-quality PNG images.',
      'Share queries with teammates using shareable links.',
      'Query parameters are embedded in URLs for easy collaboration.',
      'Load shared queries directly from the URL.',
    ],
  },
];

export default function Documentation() {
  return (
    <div className="h-full bg-[#0d1117]">
      <ScrollArea className="h-full">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Documentation</h1>
                <p className="text-xs text-gray-500">Learn how to use the SQL Query Visualizer</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-[#161b22] border border-[#21262d] p-3">
                <div className="text-blue-400 font-semibold text-sm mb-1">Interactive Diagrams</div>
                <p className="text-xs text-gray-500">Visualize table relationships and joins with drag-and-drop nodes</p>
              </div>
              <div className="rounded-lg bg-[#161b22] border border-[#21262d] p-3">
                <div className="text-purple-400 font-semibold text-sm mb-1">AI-Powered Analysis</div>
                <p className="text-xs text-gray-500">Get explanations, optimizations, and performance warnings</p>
              </div>
              <div className="rounded-lg bg-[#161b22] border border-[#21262d] p-3">
                <div className="text-green-400 font-semibold text-sm mb-1">Developer Friendly</div>
                <p className="text-xs text-gray-500">Keyboard shortcuts, templates, and query history</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={i} className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                    <h2 className="text-sm font-semibold text-white">{section.title}</h2>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {section.content.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: section.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 mt-8">
            <div className="rounded-lg bg-blue-600/5 border border-blue-600/10 p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-2">Supported SQL Syntax</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                SQL Visualizer supports standard SQL including SELECT, FROM, JOIN (INNER, LEFT, RIGHT, FULL, CROSS), 
                WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, subqueries, CTEs (WITH clauses), UNION, and window functions. 
                The visualizer works with PostgreSQL, MySQL, SQL Server, and generic SQL syntax.
              </p>
            </div>

            <div className="rounded-lg bg-purple-600/5 border border-purple-600/10 p-4">
              <h3 className="text-sm font-medium text-purple-400 mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">⌘↵</kbd> Visualize query</div>
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">⌘S</kbd> Save query</div>
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">⌘K</kbd> Open templates</div>
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">⌘H</kbd> View history</div>
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">?</kbd> Show shortcuts</div>
                <div><kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#21262d] rounded font-mono text-[10px]">Esc</kbd> Close modals</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}