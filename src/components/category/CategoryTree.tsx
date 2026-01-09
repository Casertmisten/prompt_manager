import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Folder, FolderOpen, MoreVertical, Pencil, Trash2, Palette } from 'lucide-react';
import type { Category } from '../../types/category';
import { buildCategoryTree, type CategoryTree as CategoryTreeType } from '../../services/categoryService';
import { useCategoryStore } from '../../store';
import { Button } from '../ui';

interface CategoryTreeProps {
  categories: Category[];
  selectedCategoryId?: string | null;
  onCategorySelect?: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (category: Category) => void;
  onCategoryColorChange?: (categoryId: string, color: string) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryColorChange,
}) => {
  const { expandedIds, toggleCategoryExpanded } = useCategoryStore();

  const tree = buildCategoryTree(categories);

  return (
    <div className="space-y-1">
      {tree.map((category) => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          isExpanded={expandedIds.includes(category.id)}
          isSelected={selectedCategoryId === category.id}
          selectedCategoryId={selectedCategoryId}
          onToggle={() => toggleCategoryExpanded(category.id)}
          onSelect={onCategorySelect}
          onEdit={onCategoryEdit}
          onDelete={onCategoryDelete}
          onCategoryColorChange={onCategoryColorChange}
        />
      ))}
    </div>
  );
};

interface CategoryTreeNodeProps {
  category: CategoryTreeType;
  isExpanded: boolean;
  isSelected: boolean;
  selectedCategoryId?: string | null;
  onToggle: () => void;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onCategoryColorChange?: (categoryId: string, color: string) => void;
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  category,
  isExpanded,
  isSelected,
  selectedCategoryId,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onCategoryColorChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // 点击外部关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      // 延迟打开颜色选择器，确保 DOM 完全渲染
      const timer = setTimeout(() => {
        if (colorInputRef.current) {
          colorInputRef.current.click();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(category);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(category);
  };

  const handleColorPick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowColorPicker(true);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onCategoryColorChange?.(category.id, newColor);
    // 不关闭颜色选择器，让用户可以继续选择
  };

  return (
    <div>
      <div
        className={`
          relative flex items-center justify-between px-3 py-2 rounded-lg transition-colors
          hover:bg-gray-200 dark:hover:bg-gray-700 group
        `}
      >
        <button
          onClick={() => {
            onToggle();
            onSelect?.(category);
          }}
          className="relative flex items-center gap-2 flex-1 text-left"
        >
          {category.children.length > 0 ? (
            <ChevronRight
              className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <div className="w-3" />
          )}

          {isSelected ? (
            <FolderOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Folder className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}

          <span
            className="text-sm"
            style={{ color: category.color || '#000000' }}
          >
            {category.name}
          </span>

          {category.promptCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
              {category.promptCount}
            </span>
          )}

          {/* 颜色选择器 */}
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="absolute right-0 top-0 bottom-0 w-16 z-20"
            >
              <input
                ref={colorInputRef}
                type="color"
                value={category.color || '#000000'}
                onChange={handleColorChange}
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
                style={{ width: '40px', height: '40px' }}
              />
            </div>
          )}
        </button>

        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreVertical className="w-3 h-3" />}
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          />

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] z-10"
            >
              <button
                onClick={handleRename}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pencil className="w-3 h-3" />
                重命名
              </button>
              <button
                onClick={handleColorPick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Palette className="w-3 h-3" />
                颜色
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-3 h-3" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && category.children.length > 0 && (
        <div className="ml-4 mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              isExpanded={false}
              isSelected={selectedCategoryId === child.id}
              onToggle={() => {
                // 子分类只触发选择，不触发展开/折叠
                onSelect?.(child);
              }}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onCategoryColorChange={onCategoryColorChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
