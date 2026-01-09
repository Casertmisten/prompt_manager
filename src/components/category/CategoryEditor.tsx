import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import type { Category } from '../../types/category';
import { useCategoryStore } from '../../store';
import { validateCategory } from '../../utils/validation';
import { Button, Input, Modal } from '../ui';

interface CategoryEditorProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
}

export const CategoryEditor: React.FC<CategoryEditorProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
}) => {
  const { addCategory } = useCategoryStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color || '#000000');
    } else {
      resetForm();
    }
  }, [category, isOpen]);

  const resetForm = () => {
    setName('');
    setColor('#000000');
    setError('');
  };

  const handleSave = () => {
    // Validate
    const validation = validateCategory({ name, color });
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    // 编辑模式：更新现有分类；新建模式：创建新分类对象（不包含 ID）
    const categoryData = category
      ? { ...category, name, color }
      : {
          name,
          color,
          // 不设置 id，让 store 来生成
        };

    onSave(categoryData);
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? '编辑分类' : '新建分类'} size="sm">
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="分类名称"
          placeholder="输入分类名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Folder className="w-4 h-4" />}
          error={error}
        />

        {/* Color */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            分类名称颜色
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            选择分类名称在列表中显示的颜色
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSave}>
          {category ? '保存' : '创建'}
        </Button>
      </div>
    </Modal>
  );
};