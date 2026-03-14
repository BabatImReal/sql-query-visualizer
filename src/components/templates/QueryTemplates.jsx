import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'basic-join',
    name: 'Basic Inner Join',
    description: 'Simple join between two tables',
    category: 'Joins',
    sql: `SELECT 
  u.id,
  u.name,
  o.order_id,
  o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
ORDER BY o.total DESC;`,
  },
  {
    id: 'left-join',
    name: 'Left Join with NULL Check',
    description: 'Find records without matches',
    category: 'Joins',
    sql: `SELECT 
  c.customer_id,
  c.name,
  o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
  },
  {
    id: 'multi-join',
    name: 'Multiple Table Joins',
    description: 'Join across 4+ tables',
    category: 'Joins',
    sql: `SELECT 
  u.name AS customer,
  o.order_id,
  p.product_name,
  c.category_name,
  oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days';`,
  },
  {
    id: 'cte-basic',
    name: 'Common Table Expression (CTE)',
    description: 'Use WITH clause for cleaner queries',
    category: 'Advanced',
    sql: `WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', sale_date) AS month,
    SUM(amount) AS total_sales
  FROM sales
  GROUP BY DATE_TRUNC('month', sale_date)
)
SELECT 
  month,
  total_sales,
  LAG(total_sales) OVER (ORDER BY month) AS prev_month
FROM monthly_sales
ORDER BY month DESC;`,
  },
  {
    id: 'window-function',
    name: 'Window Functions',
    description: 'Rankings and running totals',
    category: 'Advanced',
    sql: `SELECT 
  employee_id,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  SUM(salary) OVER (PARTITION BY department) AS dept_total
FROM employees
ORDER BY department, dept_rank;`,
  },
  {
    id: 'subquery',
    name: 'Correlated Subquery',
    description: 'Find above-average values',
    category: 'Advanced',
    sql: `SELECT 
  e.name,
  e.salary,
  e.department
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
  WHERE department = e.department
)
ORDER BY e.department, e.salary DESC;`,
  },
  {
    id: 'aggregation',
    name: 'Aggregation with HAVING',
    description: 'Group and filter aggregates',
    category: 'Aggregation',
    sql: `SELECT 
  category,
  COUNT(*) AS product_count,
  AVG(price) AS avg_price,
  SUM(stock) AS total_stock
FROM products
GROUP BY category
HAVING COUNT(*) >= 5 AND AVG(price) > 100
ORDER BY total_stock DESC;`,
  },
  {
    id: 'union',
    name: 'UNION Query',
    description: 'Combine results from multiple queries',
    category: 'Set Operations',
    sql: `SELECT 
  'Customer' AS type,
  name,
  email
FROM customers
WHERE country = 'US'

UNION ALL

SELECT 
  'Vendor' AS type,
  company_name AS name,
  contact_email AS email
FROM vendors
WHERE country = 'US'
ORDER BY name;`,
  },
];

export default function QueryTemplates({ isOpen, onClose, onSelectTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template) => {
    onSelectTemplate(template.sql);
    onClose();
    toast.success(`Loaded template: ${template.name}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#21262d] text-gray-200 max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="w-4 h-4 text-blue-400" />
            Query Templates
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs">
            Start with pre-built examples to learn SQL patterns
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3">
          {/* Category sidebar */}
          <div className="w-32 flex-shrink-0 space-y-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates list */}
          <ScrollArea className="flex-1 h-[500px]">
            <div className="space-y-2 pr-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="rounded-lg border border-[#21262d] bg-[#0d1117] p-3 hover:border-[#30363d] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-white">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600/20 text-blue-400 font-medium whitespace-nowrap ml-2">
                      {template.category}
                    </span>
                  </div>
                  <pre className="text-[10px] text-gray-400 font-mono bg-[#161b22] rounded p-2 mb-2 overflow-x-auto">
                    {template.sql}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    >
                      <Code2 className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(template.sql);
                        toast.success('SQL copied');
                      }}
                      className="h-7 text-xs text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}