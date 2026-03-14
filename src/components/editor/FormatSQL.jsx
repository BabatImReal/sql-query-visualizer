// Simple SQL formatter utility
export function formatSQL(sql) {
  if (!sql) return '';
  
  let formatted = sql.trim();
  
  // Main SQL keywords that should be on new lines
  const mainKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 
    'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'GROUP BY', 'HAVING',
    'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'EXCEPT', 'INTERSECT'
  ];
  
  // Add line breaks before major keywords
  mainKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword}`);
  });
  
  // Handle WITH clauses
  formatted = formatted.replace(/\bWITH\b/gi, '\nWITH');
  
  // Clean up multiple consecutive newlines
  formatted = formatted.replace(/\n\s*\n/g, '\n');
  
  // Trim lines
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');
  
  // Add indentation for certain patterns
  const lines = formatted.split('\n');
  let indentLevel = 0;
  const indented = lines.map(line => {
    const trimmed = line.trim();
    
    // Decrease indent before closing parens
    if (trimmed.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const result = '  '.repeat(indentLevel) + trimmed;
    
    // Increase indent after SELECT, FROM, WHERE, JOIN, etc.
    if (
      trimmed.startsWith('SELECT') || 
      trimmed.startsWith('FROM') || 
      trimmed.startsWith('WHERE') ||
      trimmed.match(/JOIN/i)
    ) {
      // Don't increase indent
    } else if (trimmed.endsWith('(') || trimmed.startsWith('(')) {
      indentLevel++;
    }
    
    return result;
  });
  
  return indented.join('\n').trim();
}