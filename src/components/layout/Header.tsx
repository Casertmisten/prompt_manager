import React from 'react';
import { Moon, Sun, Upload, Download } from 'lucide-react';
import { useUIStore } from '../../store';
import { Button } from '../ui';

interface HeaderProps {
  onExport?: () => void;
  onImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport, onImport }) => {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">PM</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Prompt Manager
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Upload className="w-4 h-4" />}
          onClick={onImport}
        >
          导入
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={onExport}
        >
          导出
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          onClick={toggleTheme}
        />
      </div>
    </header>
  );
};
