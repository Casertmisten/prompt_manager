import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { usePromptStore } from '../../store';
import { Input } from '../ui';

interface SearchBarProps {
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  placeholder = '搜索提示词...',
}) => {
  const { searchTerm, setSearchTerm } = usePromptStore();
  const [localTerm, setLocalTerm] = useState(searchTerm);

  // Sync with store
  useEffect(() => {
    setLocalTerm(searchTerm);
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localTerm);
      onSearchChange(localTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localTerm, setSearchTerm, onSearchChange]);

  const handleClear = () => {
    setLocalTerm('');
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        icon={<Search className="w-4 h-4" />}
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        className="w-full"
      />
      {localTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};
