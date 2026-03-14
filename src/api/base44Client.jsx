import { queryClient } from '@/api/queryClient';

const normalizeSavedQuery = (query) => ({
  ...query,
  created_date: query.created_date || query.created_at,
  updated_date: query.updated_date || query.updated_at,
  is_favorite: Boolean(query.is_favorite),
});

const extractSqlFromPrompt = (prompt = '') => {
  const match = prompt.match(/SQL Query:\s*([\s\S]*?)\n\nReturn a JSON object with:/i);
  if (match?.[1]) {
    return match[1].trim();
  }
  return prompt;
};

const inferColumnType = (name) => {
  const lower = name.toLowerCase();
  if (lower.endsWith('_id') || lower === 'id') return 'id';
  if (lower.includes('date') || lower.includes('time')) return 'date';
  if (lower.includes('count') || lower.includes('total') || lower.includes('amount')) return 'number';
  if (lower.startsWith('is_') || lower.startsWith('has_')) return 'boolean';
  return 'text';
};

const analyzeSqlLocally = (sqlText) => {
  const sql = (sqlText || '').trim();
  const normalized = sql.replace(/\s+/g, ' ');
  const tables = [];
  const tableOrder = [];
  const seen = new Set();
  const joins = [];
  const filters = [];

  const tableRegex = /\b(from|join)\s+([a-zA-Z_][\w.]*)\s*(?:as\s+)?([a-zA-Z_][\w]*)?/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(normalized)) !== null) {
    const keyword = tableMatch[1].toUpperCase();
    const tableName = tableMatch[2];
    const aliasCandidate = tableMatch[3];
    const alias = aliasCandidate && !['ON', 'WHERE', 'GROUP', 'ORDER', 'LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'JOIN'].includes(aliasCandidate.toUpperCase())
      ? aliasCandidate
      : undefined;
    if (!seen.has(tableName)) {
      seen.add(tableName);
      tableOrder.push(tableName);
      tables.push({
        name: tableName,
        alias,
        columns: [],
        colorIndex: (tables.length % 8),
      });
    }

    if (keyword === 'JOIN') {
      const from = tableOrder[Math.max(0, tableOrder.length - 2)] || tableName;
      joins.push({
        from,
        to: tableName,
        type: 'JOIN',
        condition: 'Join condition not parsed',
      });
    }
  }

  const joinRegex = /\b(inner|left|right|full|cross)?\s*join\s+([a-zA-Z_][\w.]*)\s*(?:as\s+)?([a-zA-Z_][\w]*)?\s*(?:on\s+([\s\S]*?))?(?=\b(inner|left|right|full|cross)?\s*join\b|\bwhere\b|\bgroup\s+by\b|\border\s+by\b|$)/gi;
  let joinIndex = 0;
  let joinMatch;
  while ((joinMatch = joinRegex.exec(normalized)) !== null) {
    const joinType = `${(joinMatch[1] || 'INNER').toUpperCase()} JOIN`;
    const condition = (joinMatch[4] || '').trim();
    if (joins[joinIndex]) {
      joins[joinIndex].type = joinType;
      joins[joinIndex].condition = condition || 'Missing ON condition';
    }
    joinIndex += 1;
  }

  const whereMatch = normalized.match(/\bwhere\s+([\s\S]*?)(?=\bgroup\s+by\b|\border\s+by\b|$)/i);
  if (whereMatch?.[1]) {
    whereMatch[1]
      .split(/\band\b/i)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .forEach((segment) => filters.push(segment));
  }

  const selectMatch = normalized.match(/\bselect\s+([\s\S]*?)\s+from\b/i);
  if (selectMatch?.[1]) {
    const rawColumns = selectMatch[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/\s+as\s+.+$/i, '').replace(/^distinct\s+/i, '').trim());
    if (tables[0]) {
      tables[0].columns = rawColumns.map((name) => ({
        name,
        type: inferColumnType(name),
        isKey: /(^id$|_id$)/i.test(name),
        isForeignKey: /_id$/i.test(name),
      }));
    }
  }

  const warnings = [];
  if (/\bselect\s+\*/i.test(normalized)) {
    warnings.push({ type: 'SELECT *', message: 'Avoid SELECT * for better performance and maintainability.' });
  }
  joins.forEach((join) => {
    if (!join.condition || join.condition === 'Missing ON condition') {
      warnings.push({ type: 'Cartesian Join', message: `Join from ${join.from} to ${join.to} appears to be missing an ON condition.` });
    }
  });
  if (!/\bwhere\b/i.test(normalized)) {
    warnings.push({ type: 'Missing Filter', message: 'No WHERE clause detected; query may scan many rows.' });
  }

  const complexity = tables.length <= 2 && joins.length <= 1
    ? 'Low'
    : tables.length <= 5
      ? 'Medium'
      : 'High';

  return {
    tables,
    joins,
    explanation: {
      summary: tables.length
        ? `This query reads from ${tables.map((t) => t.name).join(', ')} and returns ${tables[0]?.columns?.length || 0} selected column(s).`
        : 'This query could not be fully parsed, but SQL text was received.',
      tables: tables.map((table) => ({
        name: table.name,
        alias: table.alias || '',
        purpose: 'Referenced in the query',
      })),
      joins: joins.map((join) => ({
        type: join.type,
        explanation: `${join.type} between ${join.from} and ${join.to}${join.condition ? ` on ${join.condition}` : ''}`,
      })),
      filters,
      ordering: /\border\s+by\b/i.test(normalized) ? 'ORDER BY clause detected.' : 'No ORDER BY clause found.',
      optimizations: [
        'Create indexes for columns used in JOIN and WHERE conditions.',
        'Avoid SELECT * and request only required columns.',
        'Consider paginating large result sets with LIMIT/OFFSET.',
      ],
    },
    stats: {
      tableCount: tables.length,
      joinCount: joins.length,
      filterCount: filters.length,
      complexity,
      warnings,
      performanceTips: [
        'Index frequently filtered columns.',
        'Use explicit column lists instead of wildcard selects.',
        'Check join keys for compatible data types.',
      ],
      goodPractices: [
        ...(joins.length > 0 ? ['Uses explicit JOIN syntax.'] : []),
        ...(/\bwhere\b/i.test(normalized) ? ['Applies row filtering with WHERE.'] : []),
      ],
    },
  };
};

export const base44 = {
  auth: {
    async me() {
      throw new Error('Local mode: no authenticated Base44 user');
    },
    logout() {},
    redirectToLogin() {},
  },
  entities: {
    SavedQuery: {
      async list(sort = '-created_date', limit = 100) {
        const all = await queryClient.getAllQueries();
        const normalized = all.map(normalizeSavedQuery);
        const sorted = [...normalized].sort((a, b) => {
          if (sort === '-created_date') {
            return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
          }
          return 0;
        });
        return sorted.slice(0, limit);
      },
      async create(data) {
        const created = await queryClient.createQuery({
          ...data,
          is_favorite: Boolean(data?.is_favorite),
          tags: Array.isArray(data?.tags) ? data.tags : [],
        });
        return normalizeSavedQuery(created);
      },
      async update(id, updates) {
        const updated = await queryClient.updateQuery(id, updates);
        return normalizeSavedQuery(updated);
      },
      async delete(id) {
        await queryClient.deleteQuery(id);
        return { success: true };
      },
    },
  },
  integrations: {
    Core: {
      async InvokeLLM({ prompt }) {
        const sql = extractSqlFromPrompt(prompt);
        return analyzeSqlLocally(sql);
      },
    },
  },
};
