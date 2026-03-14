import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings as SettingsIcon, Monitor, Palette, Code2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSettings } from '@/lib/SettingsContext';

export default function Settings() {
  const { settings, saveSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const update = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(localSettings);
    toast.success('Settings saved');
  };

  return (
    <div className="h-full bg-[#0d1117]">
      <ScrollArea className="h-full">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-600/10 border border-gray-600/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Settings</h1>
              <p className="text-xs text-gray-500">Configure your preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Editor Settings */}
            <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text_WHITE">Editor</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Font Size</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Set the editor font size</p>
                  </div>
                  <Select
                    value={localSettings.fontSize}
                    onValueChange={(value) => update('fontSize', value)}
                  >
                    <SelectTrigger className="w-24 h-8 bg-[#0d1117] border-[#21262d] text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161b22] border-[#21262d]">
                      <SelectItem value="10" className="text-gray-300 text-xs">10px</SelectItem>
                      <SelectItem value="12" className="text-gray-300 text-xs">12px</SelectItem>
                      <SelectItem value="14" className="text-gray-300 text-xs">14px</SelectItem>
                      <SelectItem value="16" className="text-gray-300 text-xs">16px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Line Numbers</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Show line numbers in the editor</p>
                  </div>
                  <Switch
                    checked={localSettings.lineNumbers}
                    onCheckedChange={(value) => update('lineNumbers', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Word Wrap</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Wrap long lines in the editor</p>
                  </div>
                  <Switch
                    checked={localSettings.wordWrap}
                    onCheckedChange={(value) => update('wordWrap', value)}
                  />
                </div>
              </div>
            </div>

            {/* Visualization Settings */}
            <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-white">Visualization</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Show Grid</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Display grid background on canvas</p>
                  </div>
                  <Switch
                    checked={localSettings.showGrid}
                    onCheckedChange={(value) => update('showGrid', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Animated Connections</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Animate join connector lines</p>
                  </div>
                  <Switch
                    checked={localSettings.animatedConnections}
                    onCheckedChange={(value) => update('animatedConnections', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Layout Direction</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Default arrangement of table nodes</p>
                  </div>
                  <Select
                    value={localSettings.layoutDirection}
                    onValueChange={(value) => update('layoutDirection', value)}
                  >
                    <SelectTrigger className="w-28 h-8 bg-[#0d1117] border-[#21262d] text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161b22] border-[#21262d]">
                      <SelectItem value="horizontal" className="text-gray-300 text-xs">Horizontal</SelectItem>
                      <SelectItem value="vertical" className="text-gray-300 text-xs">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* General */}
            <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-white">General</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Auto-visualize on paste</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Automatically visualize when pasting SQL</p>
                  </div>
                  <Switch
                    checked={localSettings.autoVisualizeOnPaste}
                    onCheckedChange={(value) => update('autoVisualizeOnPaste', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-300">Include optimization tips</Label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Show query optimization suggestions</p>
                  </div>
                  <Switch
                    checked={localSettings.includeOptimizationTips}
                    onCheckedChange={(value) => update('includeOptimizationTips', value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} className="px-4 py-2 text-xs">
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}