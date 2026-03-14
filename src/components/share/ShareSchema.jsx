import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareQuery({ isOpen, onClose, sql }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = sql 
    ? `${window.location.origin}/Workspace?sql=${encodeURIComponent(sql)}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Share2 className="w-4 h-4 text-blue-400" />
            Share Query
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs">
            Share this SQL query with your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-[#0d1117] border-[#21262d] text-gray-300 font-mono text-xs flex-1"
              />
              <Button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-900/10 border border-blue-900/20 p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-300 mb-1">How it works</p>
                <p className="text-xs text-blue-200/70">
                  Anyone with this link can view and visualize this SQL query. 
                  The query is embedded in the URL for easy sharing.
                </p>
              </div>
            </div>
          </div>

          {sql && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Query Preview
              </label>
              <pre className="text-[10px] text-gray-400 font-mono bg-[#0d1117] rounded p-3 max-h-32 overflow-auto border border-[#21262d]">
                {sql}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}