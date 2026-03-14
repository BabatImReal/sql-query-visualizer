import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Trash2, Code2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MAX_HISTORY = 20;
const STORAGE_KEY = 'sql_visualizer_history';

export function useQueryHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const addToHistory = (sql) => {
    if (!sql || !sql.trim()) return;
    
    const newEntry = {
      id: Date.now(),
      sql: sql.trim(),
      timestamp: new Date().toISOString(),
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.sql !== sql.trim());
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('History cleared');
  };

  return { history, addToHistory, clearHistory };
}

export default function QueryHistory({ isOpen, onClose, onSelectQuery }) {
  const { history, clearHistory } = useQueryHistory();

  const handleUseQuery = (sql) => {
    onSelectQuery(sql);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200 max-w-3xl max-h-[70vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-blue-400" />
              Query History
            </DialogTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-7 text-xs text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No query history yet</p>
              <p className="text-xs text-gray-600 mt-1">Your visualized queries will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 pr-3">
              {history.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-[#21262d] bg-[#0d1117] p-3 hover:border-[#30363d] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                    </span>
                    <span className="text-[10px] text-gray-600">#{history.length - idx}</span>
                  </div>
                  <pre className="text-[10px] text-gray-400 font-mono bg-[#161b22] rounded p-2 mb-2 max-h-24 overflow-auto">
                    {entry.sql}
                  </pre>
                  <Button
                    size="sm"
                    onClick={() => handleUseQuery(entry.sql)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    <Code2 className="w-3 h-3 mr-1" />
                    Load Query
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}