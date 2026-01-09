import React, { useState } from 'react';
import { Plus, Folder, FolderOpen, Tag } from 'lucide-react';
import { useCategoryStore, usePromptStore } from '../../store';
import { Button } from '../ui';
import { CategoryTree } from '../category';
import { CategoryEditor, TagManager } from '../category';
import { createCategory } from '../../services/categoryService';

interface SidebarProps {
  selectedCategory: { id: string; name: string } | null;
  onCategorySelect: (category: { id: string; name: string } | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategorySelect }) => {
  const { categories, tags, addCategory, deleteCategory, updateCategory } = useCategoryStore();
  const { prompts } = usePromptStore();

  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  return (
    <aside className="w-64 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Navigation */}
      <div className="p-4 flex flex-col gap-1">
        <NavItem
          icon={<Folder className="w-4 h-4" />}
          label="所有提示词"
          count={prompts.length}
          isSelected={!selectedCategory}
          onClick={() => {
            onCategorySelect(null);
          }}
        />
        <NavItem
          icon={<Tag className="w-4 h-4" />}
          label="标签"
          count={tags.length}
          onClick={() => setIsTagManagerOpen(true)}
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            分类
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            className="h-6 w-6 p-0"
            onClick={() => {
              setEditingCategoryId(null);  // 清空编辑的分类ID，表示新建模式
              setIsCategoryEditorOpen(true);
            }}
          />
        </div>

        {categories.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            暂无分类
          </div>
        ) : (
          <CategoryTree
            categories={categories}
            selectedCategoryId={selectedCategory?.id || null}
            onCategorySelect={(cat) => {
              onCategorySelect(cat);
            }}
            onCategoryEdit={(cat) => {
              setEditingCategoryId(cat.id);  // 设置正在编辑的分类ID
              setIsCategoryEditorOpen(true);
            }}
            onCategoryDelete={(cat) => {
              if (confirm(`确定要删除"${cat.name}"吗？`)) {
                deleteCategory(cat.id);
                // 如果删除的是当前选中的分类，清除选择
                if (selectedCategory?.id === cat.id) {
                  onCategorySelect(null);
                }
              }
            }}
            onCategoryColorChange={(categoryId, color) => {
              updateCategory(categoryId, { color });
            }}
          />
        )}
      </div>

      {/* Copyright */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">copyright@TaTu_Forever</p>
      </div>

      {/* Modals */}
      <CategoryEditor
        isOpen={isCategoryEditorOpen}
        category={editingCategoryId ? categories.find((c) => c.id === editingCategoryId) || null : null}
        onClose={() => {
          setIsCategoryEditorOpen(false);
          setEditingCategoryId(null);
        }}
        onSave={(category) => {
          if (category?.id) {
            // 编辑现有分类
            updateCategory(category.id, { name: category.name, color: category.color });
          } else {
            // 新建分类 - 使用 createCategory 创建完整的 Category 对象
            const newCategory = createCategory({
              name: category.name,
              color: category.color,
            });
            addCategory(newCategory);
          }
          setIsCategoryEditorOpen(false);
          setEditingCategoryId(null);
        }}
      />

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, count, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        {isSelected ? (
          <FolderOpen className="w-4 h-4" />
        ) : (
          icon
        )}
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
};

