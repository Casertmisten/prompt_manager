import React from 'react';
import { Clock, Copy, FileText, Tag } from 'lucide-react';
import type { Prompt } from '../../types/prompt';
import { formatDate, truncateText } from '../../utils/formatters';
import { Button } from '../ui';

interface PromptCardProps {
  prompt: Prompt;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onClick,
  onEdit,
  onDelete,
  onCopy,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {truncateText(prompt.description, 100)}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy?.();
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="复制当前版本"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {/* Content Preview */}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {truncateText(prompt.content, 150)}
          </p>
        </div>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {prompt.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{prompt.tags.length - 3} 更多
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(prompt.updatedAt, 'MM-DD HH:mm')}</span>
          <span>·</span>
          <span>版本 {prompt.currentVersion}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            删除
          </Button>
        </div>
      </div>
    </div>
  );
};
