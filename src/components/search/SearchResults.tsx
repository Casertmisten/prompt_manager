import React from 'react';
import { FileText } from 'lucide-react';
import { Prompt } from '../../types/prompt';
import { PromptCard } from '../prompt';
import { highlightKeyword } from '../../utils/formatters';

interface SearchResultsProps {
  prompts: Prompt[];
  searchTerm: string;
  onSelect?: (prompt: Prompt) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  prompts,
  searchTerm,
  onSelect,
}) => {
  if (!searchTerm && prompts.length === 0) {
    return null;
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          没有找到匹配的结果
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          试试其他关键词或清除筛选条件
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          找到 {prompts.length} 个结果
        </p>
        {searchTerm && (
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            清除搜索
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onClick={() => onSelect?.(prompt)}
          />
        ))}
      </div>
    </div>
  );
};
