import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

const DEFAULT_SETTINGS = {
  fontSize: '12',
  lineNumbers: true,
  wordWrap: false,
  showGrid: true,
  animatedConnections: true,
  layoutDirection: 'horizontal',
  autoVisualizeOnPaste: false,
  includeOptimizationTips: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem('user_preferences');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // If parsing fails, fall back to defaults
      }
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('user_preferences', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
