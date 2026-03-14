import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['⌘', 'Enter'], description: 'Visualize query', category: 'Editor' },
  { keys: ['Ctrl', 'Enter'], description: 'Visualize query (Windows)', category: 'Editor' },
  { keys: ['⌘', 'S'], description: 'Save query', category: 'Editor' },
  { keys: ['Ctrl', 'S'], description: 'Save query (Windows)', category: 'Editor' },
  { keys: ['⌘', 'K'], description: 'Open templates', category: 'Navigation' },
  { keys: ['⌘', 'H'], description: 'Open history', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close modals', category: 'General' },
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Keyboard className="w-4 h-4 text-blue-400" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <React.Fragment key={j}>
                            {j > 0 && <span className="text-gray-600 text-xs">+</span>}
                            <kbd className="px-2 py-1 text-xs bg-[#0d1117] border border-[#21262d] rounded font-mono text-gray-400">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[#21262d]">
          <p className="text-xs text-gray-600">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-[#0d1117] border border-[#21262d] rounded text-[10px] font-mono">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}