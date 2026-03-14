import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Trash2, Star, Clock, Code2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SavedQueries() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['saved-queries'],
    queryFn: () => base44.entities.SavedQuery.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedQuery.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-queries'] });
      toast.success('Query deleted');
    },
  });

  const toggleFavMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.SavedQuery.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-queries'] }),
  });

  const filtered = queries.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.sql?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#21262d]">
        <h1 className="text-xl font-semibold text-white mb-4">Saved Queries</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#161b22] border-[#21262d] text-white placeholder:text-gray-600 h-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-lg bg-[#161b22] border border-[#21262d] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Code2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">
                {search ? 'No queries match your search' : 'No saved queries yet'}
              </p>
              <p className="text-xs text-gray-600">
                {!search && 'Visualize a SQL query and save it from the workspace'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(query => (
                <div
                  key={query.id}
                  className="group rounded-lg bg-[#161b22] border border-[#21262d] hover:border-[#30363d] transition-colors p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{query.title}</h3>
                      {query.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{query.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-amber-400 hover:bg-[#21262d]"
                        onClick={() => toggleFavMutation.mutate({ id: query.id, is_favorite: query.is_favorite })}
                      >
                        <Star className={`w-3.5 h-3.5 ${query.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-[#21262d]"
                        onClick={() => deleteMutation.mutate(query.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <pre className="text-[10px] text-gray-500 font-mono bg-[#0d1117] rounded p-2 mb-3 line-clamp-3 overflow-hidden">
                    {query.sql}
                  </pre>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {query.created_date ? format(new Date(query.created_date), 'MMM d, yyyy') : ''}
                      </span>
                    </div>
                    <Link
                      to={`/Workspace?sql=${encodeURIComponent(query.sql)}`}
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Open in Workspace
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}