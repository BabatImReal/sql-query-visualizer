import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Save, Download, Share2, FileText, Clock, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SQLEditor from '@/components/editor/SQLEditor';
import QueryCanvas from '@/components/canvas/QueryCanvas';
import QueryExplanation from '@/components/explanation/QueryExplantion';
import QueryStats from '@/components/stats/QueryStats';
import JoinDetailModal from '@/components/canvas/JoinDetailModal';
import QueryTemplates from '@/components/templates/QueryTemplates';
import QueryHistory, { useQueryHistory } from '@/components/history/QueryHistory';
import KeyboardShortcuts from '@/components/help/KeyboardShortcuts';
import ShareQuery from '@/components/share/ShareSchema';
import SchemaExplorer from '@/components/schema/SchemaExplorer';
import html2canvas from 'html2canvas';

export default function Workspace() {
  console.log('Workplace component rendering');
  const urlParams = new URLSearchParams(window.location.search);
  const sqlFromURL = urlParams.get('sql');

  // Show welcome hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('sql_visualizer_seen_hint');
    if (!hasSeenHint) {
      setTimeout(() => {
        toast.info('Press ? to view keyboard shortcuts', { duration: 5000 });
        localStorage.setItem('sql_visualizer_seen_hint', 'true');
      }, 2000);
    }
  }, []);

  const [tables, setTables] = useState([]);
  const [joins, setJoins] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [stats, setStats] = useState(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [currentSQL, setCurrentSQL] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedJoin, setSelectedJoin] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState('explanation'); // 'explanation' | 'stats'
  const { addToHistory } = useQueryHistory();

  const handleVisualize = useCallback(async (sql) => {
    if (!sql.trim()) return;
    setCurrentSQL(sql);
    setIsVisualizing(true);
    setIsExplaining(true);
    addToHistory(sql);

    try {
      // Parse the SQL to extract tables, joins, and explanation using LLM
      const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this SQL query and extract detailed structure for visualization and performance analysis.

SQL Query:
${sql}

Return a JSON object with:
1. "tables" - array of tables used in the query, each with:
   - "name": the table name
   - "alias": the alias used (if any)
   - "columns": array of columns referenced for this table, each with:
     - "name": column name
     - "type": inferred type (like "id", "text", "number", "date", "boolean") 
     - "isKey": boolean if it seems like a primary key
     - "isForeignKey": boolean if used in a join condition
   - "colorIndex": a number 0-7 for coloring

2. "joins" - array of join relationships:
   - "from": source table name
   - "to": target table name
   - "type": join type (e.g. "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN")
   - "condition": the ON condition text
   
3. "explanation" - object with:
   - "summary": a 1-2 sentence plain English summary of what the query does
   - "tables": array of {name, alias, purpose} describing each table's role
   - "joins": array of {type, explanation} describing each join in plain English
   - "filters": array of strings describing each WHERE/HAVING condition
   - "ordering": string describing ORDER BY if present
   - "optimizations": array of 2-3 optimization suggestions

4. "stats" - object with:
   - "tableCount": number of tables
   - "joinCount": number of joins
   - "filterCount": number of WHERE/HAVING conditions
   - "complexity": "Low", "Medium", or "High" based on query complexity
   - "warnings": array of {type, message} for issues like:
     * Cartesian joins (missing join conditions)
     * Unused tables (tables in FROM but not referenced)
     * SELECT * (should specify columns)
     * Missing indexes (columns used in WHERE/JOIN without indexes)
     * Subqueries that could be rewritten as joins
   - "performanceTips": array of 2-3 specific performance improvement suggestions
   - "goodPractices": array of positive practices found in the query

Be thorough in extracting columns. If a column is in SELECT, WHERE, JOIN, GROUP BY, or ORDER BY, include it.
For columns where the table isn't clear, make a reasonable guess based on naming conventions.

CRITICAL ANALYSIS RULES:
- If a join has no ON condition (Cartesian join), add to warnings with type "Cartesian Join" 
- If a table appears in FROM but columns are never referenced, add to warnings with type "Unused Table"
- If query uses SELECT *, add to warnings with type "SELECT *"
- Check for missing WHERE clauses on large tables
- Look for opportunities to add indexes
- Identify subqueries that could be rewritten as joins
- Suggest query simplifications

Complexity assessment:
- Low: 1-2 tables, simple joins, basic WHERE
- Medium: 3-5 tables, multiple joins, subqueries or CTEs
- High: 6+ tables, nested subqueries, window functions, complex logic`,
      response_json_schema: {
        type: "object",
        properties: {
          tables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                alias: { type: "string" },
                columns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      isKey: { type: "boolean" },
                      isForeignKey: { type: "boolean" }
                    }
                  }
                },
                colorIndex: { type: "number" }
              }
            }
          },
          joins: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                type: { type: "string" },
                condition: { type: "string" }
              }
            }
          },
          explanation: {
            type: "object",
            properties: {
              summary: { type: "string" },
              tables: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    alias: { type: "string" },
                    purpose: { type: "string" }
                  }
                }
              },
              joins: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    explanation: { type: "string" }
                  }
                }
              },
              filters: { type: "array", items: { type: "string" } },
              ordering: { type: "string" },
              optimizations: { type: "array", items: { type: "string" } }
            }
          },
          stats: {
            type: "object",
            properties: {
              tableCount: { type: "number" },
              joinCount: { type: "number" },
              filterCount: { type: "number" },
              complexity: { type: "string" },
              warnings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    message: { type: "string" }
                  }
                }
              },
              performanceTips: { type: "array", items: { type: "string" } },
              goodPractices: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

      setTables(result.tables || []);
      setJoins(result.joins || []);
      setIsVisualizing(false);

      setExplanation(result.explanation || null);
      setStats(result.stats || null);
      setIsExplaining(false);
    } catch (error) {
      console.error('Visualization error:', error);
      toast.error('Failed to visualize query. Please check your SQL syntax.');
      setIsVisualizing(false);
      setIsExplaining(false);
    }
  }, [addToHistory]);

  const handleSave = async () => {
    if (!saveTitle.trim() || !currentSQL.trim()) return;
    await base44.entities.SavedQuery.create({
      title: saveTitle,
      sql: currentSQL,
      description: explanation?.summary || '',
    });
    toast.success('Query saved successfully');
    setSaveDialogOpen(false);
    setSaveTitle('');
  };

  const handleExport = async () => {
    const canvas = document.querySelector('[data-canvas-export]');
    if (!canvas) {
      toast.error('No diagram to export');
      return;
    }
    toast.info('Generating diagram...');
    const rendered = await html2canvas(canvas, { backgroundColor: '#0d1117', scale: 2 });
    const link = document.createElement('a');
    link.download = `sql-diagram-${Date.now()}.png`;
    link.href = rendered.toDataURL();
    link.click();
    toast.success('Diagram exported as PNG');
  };

  const handleJoinClick = useCallback((join) => {
    setSelectedJoin(join);
    setJoinModalOpen(true);
  }, []);

  const handleLoadTemplate = useCallback((sql) => {
    setCurrentSQL(sql);
    handleVisualize(sql);
  }, [handleVisualize]);

  const handleInsertSQL = useCallback((sql) => {
    setCurrentSQL(sql);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Enter to visualize
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentSQL.trim()) {
          handleVisualize(currentSQL);
        }
      }
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (currentSQL.trim()) {
          setSaveDialogOpen(true);
        }
      }
      // Cmd/Ctrl + K for templates
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setTemplatesOpen(true);
      }
      // Cmd/Ctrl + H for history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setHistoryOpen(true);
      }
      // ? for shortcuts help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSQL, handleVisualize]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-[#21262d] bg-[#0d1117] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs gap-1.5 ${
              schemaOpen 
                ? 'text-blue-400 bg-[#21262d]' 
                : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
            }`}
            onClick={() => setSchemaOpen(!schemaOpen)}
          >
            <Database className="w-3.5 h-3.5" />
            Schema
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#21262d] gap-1.5"
            onClick={() => setTemplatesOpen(true)}
          >
            <FileText className="w-3.5 h-3.5" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#21262d] gap-1.5"
            onClick={() => setHistoryOpen(true)}
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#21262d] gap-1.5"
            onClick={() => setShareOpen(true)}
            disabled={!currentSQL.trim()}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#21262d] gap-1.5"
            onClick={() => { setSaveTitle(''); setSaveDialogOpen(true); }}
            disabled={!currentSQL.trim()}
          >
            <Save className="w-3.5 h-3.5" />
            Save
            <kbd className="ml-1 px-1 py-0.5 text-[9px] bg-[#21262d] rounded">⌘S</kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400 hover:text-white hover:bg-[#21262d] gap-1.5"
            onClick={handleExport}
            disabled={tables.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Explorer */}
        <SchemaExplorer 
          isOpen={schemaOpen} 
          onClose={() => setSchemaOpen(false)}
          onInsertSQL={handleInsertSQL}
        />

        {/* Left Panel - SQL Editor */}
        <div className="w-[320px] border-r border-[#21262d] flex-shrink-0">
          <SQLEditor 
            onVisualize={handleVisualize} 
            initialSQL={sqlFromURL || undefined}
            currentSQL={currentSQL}
            onSQLChange={setCurrentSQL}
          />
        </div>

        {/* Center Panel - Canvas */}
        <div className="flex-1" data-canvas-export>
          <QueryCanvas tables={tables} joins={joins} isLoading={isVisualizing} onJoinClick={handleJoinClick} />
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-[300px] border-l border-[#21262d] flex-shrink-0 flex flex-col">
          <div className="flex border-b border-[#21262d] bg-[#161b22]">
            <button
              onClick={() => setRightPanel('explanation')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                rightPanel === 'explanation'
                  ? 'text-white bg-[#0d1117] border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setRightPanel('stats')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                rightPanel === 'stats'
                  ? 'text-white bg-[#0d1117] border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Analysis
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanel === 'explanation' ? (
              <QueryExplanation explanation={explanation} isLoading={isExplaining} />
            ) : (
              <QueryStats stats={stats} />
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">Save Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Query name..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="bg-[#0d1117] border-[#21262d] text-white placeholder:text-gray-600"
              autoFocus
            />
            {explanation?.summary && (
              <p className="text-xs text-gray-500">{explanation.summary}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-[#21262d]">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!saveTitle.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Detail Modal */}
      <JoinDetailModal
        join={selectedJoin}
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

      {/* Query Templates */}
      <QueryTemplates
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Query History */}
      <QueryHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectQuery={handleLoadTemplate}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Share Query */}
      <ShareQuery
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        sql={currentSQL}
      />
    </div>
  );
}