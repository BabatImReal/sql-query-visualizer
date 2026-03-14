import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, ChevronRight, ChevronDown, Table, Columns, Upload, X, Search, Key, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchemaExplorer({ isOpen, onClose, onInsertSQL }) {
  const [schema, setSchema] = useState(null);
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setSchema(parsed);
      toast.success('Schema loaded successfully');
    } catch {
      toast.error('Invalid JSON file');
    }
  };

  const toggleTable = (tableName) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleTableClick = (table) => {
    const columnList = table.columns.map(c => c.name).join(', ');
    const sql = `SELECT ${columnList}\nFROM ${table.name}`;
    onInsertSQL(sql);
    toast.success(`Inserted SELECT from ${table.name}`);
  };

  const handleColumnClick = (tableName, column) => {
    const sql = `SELECT ${column.name}\nFROM ${tableName}`;
    onInsertSQL(sql);
    toast.success(`Inserted column ${column.name}`);
  };

  const handleJoinClick = (table1, table2, fk) => {
    const sql = `SELECT *\nFROM ${table1}\nINNER JOIN ${table2} ON ${table1}.${fk.column} = ${table2}.${fk.references}`;
    onInsertSQL(sql);
    toast.success('Inserted JOIN query');
  };

  const filteredTables = schema?.tables?.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.columns.some(col => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-[#0d1117] border-r border-[#21262d] flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#21262d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Schema Explorer</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-gray-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Upload Section */}
      {!schema && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-white mb-2">Upload Schema</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-[200px] mx-auto">
              Upload a JSON file containing your database schema
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Choose File
              </Button>
            </label>
            <p className="text-[10px] text-gray-600 mt-4">
              Expected format: &#123;"tables": [...]&#125;
            </p>
          </div>
        </div>
      )}

      {/* Schema Browser */}
      {schema && (
        <>
          {/* Search */}
          <div className="p-3 border-b border-[#21262d]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs bg-[#161b22] border-[#21262d]"
              />
            </div>
          </div>

          {/* Tables List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredTables.map((table) => (
                <div key={table.name} className="rounded-md overflow-hidden">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#161b22] cursor-pointer group"
                    onClick={() => toggleTable(table.name)}
                  >
                    {expandedTables.has(table.name) ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    <Table className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-gray-300 flex-1">{table.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableClick(table);
                      }}
                      title="Insert SELECT"
                    >
                      <span className="text-[10px] text-blue-400">+</span>
                    </Button>
                  </div>

                  {expandedTables.has(table.name) && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {table.columns.map((column) => (
                        <div
                          key={column.name}
                          className="flex items-center gap-2 px-2 py-1 hover:bg-[#161b22] cursor-pointer group rounded"
                          onClick={() => handleColumnClick(table.name, column)}
                          draggable
                          onDragStart={() => handleDragStart({ type: 'column', table: table.name, column: column.name })}
                        >
                          {column.is_primary_key && <Key className="w-3 h-3 text-yellow-400" />}
                          {column.foreign_key && <Link2 className="w-3 h-3 text-purple-400" />}
                          {!column.is_primary_key && !column.foreign_key && <Columns className="w-3 h-3 text-gray-600" />}
                          <span className="text-xs text-gray-400 flex-1">{column.name}</span>
                          <span className="text-[10px] text-gray-600">{column.type}</span>
                        </div>
                      ))}

                      {/* Foreign Key Joins */}
                      {table.columns.filter(c => c.foreign_key).map((fk) => (
                        <div
                          key={fk.name}
                          className="flex items-center gap-1.5 px-2 py-1 ml-4 hover:bg-purple-900/10 cursor-pointer rounded border-l-2 border-purple-600/30"
                          onClick={() => handleJoinClick(table.name, fk.foreign_key.table, { column: fk.name, references: fk.foreign_key.column })}
                        >
                          <Link2 className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] text-purple-300">JOIN {fk.foreign_key.table}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-[#21262d] flex-shrink-0">
            <div className="text-[10px] text-gray-600 space-y-1">
              <div>💡 Click table names to insert SELECT</div>
              <div>💡 Click columns to select specific fields</div>
              <div>💡 Click JOIN links for auto-join queries</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}