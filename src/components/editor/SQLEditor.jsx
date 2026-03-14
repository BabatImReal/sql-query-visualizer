import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Copy, Trash2, RotateCcw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatSQL } from './FormatSQL';

const SQL_KEYWORDS = [
  'SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS',
  'ON','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS','NULL','AS','CASE',
  'WHEN','THEN','ELSE','END','GROUP','BY','ORDER','HAVING','LIMIT','OFFSET',
  'UNION','ALL','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE',
  'ALTER','DROP','INDEX','VIEW','WITH','DISTINCT','COUNT','SUM','AVG','MIN','MAX',
  'ASC','DESC','COALESCE','CAST','OVER','PARTITION','ROW_NUMBER','RANK','DENSE_RANK',
  'LAG','LEAD','FIRST_VALUE','LAST_VALUE','CTE','RECURSIVE','NATURAL','USING','FETCH',
  'NEXT','ROWS','ONLY','EXCEPT','INTERSECT','LATERAL','UNNEST','ARRAY','JSONB','JSON',
  'ILIKE','SIMILAR','TO','ANY','SOME','BOOLEAN','INTEGER','VARCHAR','TEXT','DATE',
  'TIMESTAMP','INTERVAL','NUMERIC','FLOAT','SERIAL','BIGINT','SMALLINT','CHAR'
];

const SAMPLE_QUERY = `SELECT 
  u.id,
  u.name,
  u.email,
  o.order_id,
  o.total_amount,
  p.product_name,
  p.category,
  oi.quantity,
  oi.unit_price
FROM users u
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
  AND o.created_at >= '2024-01-01'
  AND p.category IN ('Electronics', 'Books')
GROUP BY u.id, u.name, u.email, o.order_id, o.total_amount, p.product_name, p.category, oi.quantity, oi.unit_price
ORDER BY o.total_amount DESC
LIMIT 100;`;

function highlightSQL(code) {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let result = escaped;

  // Strings
  result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');

  // Numbers
  result = result.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-amber-400">$1</span>');

  // Comments
  result = result.replace(/(--.*$)/gm, '<span class="text-gray-500 italic">$1</span>');

  // Keywords
  const kwPattern = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi');
  result = result.replace(kwPattern, (match) => {
    // Don't highlight inside already-highlighted spans
    return `<span class="text-blue-400 font-semibold">${match.toUpperCase()}</span>`;
  });

  // Table aliases / identifiers after AS
  result = result.replace(/\b(AS)\b\s+(<span[^>]*>[^<]*<\/span>|(\w+))/gi, (match) => {
    return match;
  });

  return result;
}

export default function SQLEditor({ onVisualize, initialSQL, currentSQL, onSQLChange }) {
  const [sql, setSQL] = useState(initialSQL || SAMPLE_QUERY);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  // Sync with external SQL changes
  useEffect(() => {
    if (currentSQL !== undefined && currentSQL !== sql) {
      setSQL(currentSQL);
    }
  }, [currentSQL]);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    if (initialSQL !== undefined && initialSQL !== null) {
      setSQL(initialSQL);
    }
  }, [initialSQL]);

  const handleSQLChange = (newSQL) => {
    setSQL(newSQL);
    if (onSQLChange) {
      onSQLChange(newSQL);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    toast.success('SQL copied to clipboard');
  };

  const handleClear = () => {
    setSQL('');
    textareaRef.current?.focus();
  };

  const handleReset = () => {
    setSQL(SAMPLE_QUERY);
  };

  const handleFormat = () => {
    const formatted = formatSQL(sql);
    handleSQLChange(formatted);
    toast.success('SQL formatted');
  };

  const lineCount = sql.split('\n').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#21262d] bg-[#161b22]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">SQL Editor</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" 
            onClick={handleFormat}
            title="Format SQL"
          >
            <Wand2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" 
            onClick={handleCopy}
            title="Copy SQL"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" 
            onClick={handleReset}
            title="Reset to sample"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]" 
            onClick={handleClear}
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d1117] border-r border-[#21262d] overflow-hidden z-10">
          <div className="pt-3 pb-3" style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[11px] text-gray-600 text-right pr-2 leading-[20px]">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Highlight layer */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 pl-12 pr-3 pt-3 pb-3 overflow-auto pointer-events-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: '12px',
            lineHeight: '20px',
            whiteSpace: 'pre',
            margin: 0,
            color: '#e6edf3',
          }}
          dangerouslySetInnerHTML={{ __html: highlightSQL(sql) + '\n' }}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => handleSQLChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          className="absolute inset-0 pl-12 pr-3 pt-3 pb-3 bg-transparent text-transparent caret-blue-400 resize-none outline-none overflow-auto"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: '12px',
            lineHeight: '20px',
            whiteSpace: 'pre',
          }}
        />
      </div>

      <div className="px-3 py-2 border-t border-[#21262d] bg-[#161b22] flex items-center justify-between">
        <span className="text-[10px] text-gray-500 font-mono">
          {lineCount} lines · {sql.length} chars
        </span>
        <Button
          onClick={() => onVisualize(sql)}
          disabled={!sql.trim()}
          className="h-8 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          Visualize
          <kbd className="ml-1 px-1 py-0.5 text-[9px] bg-blue-700/50 rounded">⌘↵</kbd>
        </Button>
      </div>
    </div>
  );
}