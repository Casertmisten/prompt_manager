import React from 'react';
import { Plus } from 'lucide-react';
import type { Prompt } from '../../types/prompt';
import { PromptCard } from './PromptCard';
import { Button } from '../ui';

interface PromptListProps {
  prompts: Prompt[];
  onCreate?: () => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  onSelect?: (prompt: Prompt) => void;
  onCopy?: (prompt: Prompt) => void;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  onCreate,
  onEdit,
  onDelete,
  onSelect,
  onCopy,
}) => {
  // 按更新时间倒序排序（最新的在前）
  const sortedPrompts = React.useMemo(() => {
    return [...prompts].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [prompts]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            提示词列表
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            共 {prompts.length} 个提示词
          </p>
        </div>

        <Button icon={<Plus className="w-4 h-4" />} onClick={onCreate}>
          新建提示词
        </Button>
      </div>

      {/* Empty State */}
      {sortedPrompts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            暂无提示词
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
            创建您的第一个AI提示词，开始提高工作效率
          </p>
          <Button icon={<Plus className="w-4 h-4" />} onClick={onCreate}>
            创建提示词
          </Button>
        </div>
      )}

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onClick={() => onSelect?.(prompt)}
            onEdit={() => onEdit?.(prompt)}
            onDelete={() => onDelete?.(prompt)}
            onCopy={() => onCopy?.(prompt)}
          />
        ))}
      </div>
    </div>
  );
};
