import React, { useState } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import type { Tag } from '../../types/category';
import { useCategoryStore } from '../../store';
import { Button } from '../ui';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags,
}) => {
  const { tags } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleTag = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);

    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      if (maxTags && selectedTags.length >= maxTags) {
        return;
      }
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleAddCustomTag = () => {
    if (searchTerm.trim() && !selectedTags.includes(searchTerm.trim())) {
      if (maxTags && selectedTags.length >= maxTags) {
        return;
      }
      onTagsChange([...selectedTags, searchTerm.trim()]);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return (
              <button
                key={tagName}
                onClick={() => handleToggleTag(tagName)}
                className={`
                  inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg
                  transition-colors border border-gray-200 dark:border-gray-700
                  ${
                    tag
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                `}
                style={tag ? { borderColor: tag.color } : undefined}
              >
                <TagIcon className="w-3 h-3" />
                {tagName}
                <X className="w-3 h-3 ml-1" />
              </button>
            );
          })}
          {maxTags && selectedTags.length >= maxTags && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              已达到最大标签数
            </span>
          )}
        </div>
      )}

      {/* Add Tag Button */}
      <Button
        variant="secondary"
        size="sm"
        icon={<TagIcon className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        添加标签
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="搜索或新建标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tag List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? (
                    <button
                      onClick={handleAddCustomTag}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      创建 "{searchTerm}" 标签
                    </button>
                  ) : (
                    '暂无标签'
                  )}
                </div>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.name)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                        transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                        ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''}
                      `}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1">{tag.name}</span>
                      {isSelected && (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
