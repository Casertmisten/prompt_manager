import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { PromptFilters } from '../../types/prompt';
import { useCategoryStore, usePromptStore } from '../../store';
import { Button } from '../ui';
import { TagSelector } from '../category';

interface FilterPanelProps {
  filters: PromptFilters;
  onFiltersChange: (filters: PromptFilters) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isOpen = false,
  onToggle,
}) => {
  const { categories, tags: allTags } = useCategoryStore();
  const { prompts } = usePromptStore();

  const [localFilters, setLocalFilters] = useState<PromptFilters>(filters);

  const handleCategoryChange = (categoryId: string | undefined) => {
    setLocalFilters({ ...localFilters, categoryId });
  };

  const handleTagsChange = (tags: string[]) => {
    setLocalFilters({ ...localFilters, tags });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onToggle?.();
  };

  const handleClear = () => {
    const clearedFilters: PromptFilters = { tags: [] };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onToggle?.();
  };

  const hasActiveFilters =
    localFilters.tags.length > 0 ||
    !!localFilters.categoryId;

  return (
    <div className="relative">
      <Button
        variant={hasActiveFilters ? 'primary' : 'secondary'}
        size="sm"
        icon={<Filter className="w-4 h-4" />}
        onClick={onToggle}
      >
        筛选
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-full text-xs">
            {[
              localFilters.tags.length,
              localFilters.categoryId ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />

          {/* Filter Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文件夹
                </label>
                <select
                  value={localFilters.categoryId || ''}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部文件夹</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                <TagSelector
                  selectedTags={localFilters.tags}
                  onTagsChange={handleTagsChange}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                清除
              </Button>
              <Button size="sm" onClick={handleApply}>
                应用
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
