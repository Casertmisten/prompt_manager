import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button, Input, Modal } from '../ui';
import type { Tag } from '../../types/category';
import { useCategoryStore } from '../../store';
import { createTag } from '../../services/categoryService';
import { validateTag } from '../../utils/validation';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ isOpen, onClose }) => {
  const { tags, addTag, updateTag, deleteTag } = useCategoryStore();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
    setErrors({});
  };

  const handleAddTag = () => {
    // Validate
    const validation = validateTag({ name: tagName, color: tagColor });
    if (!validation.valid) {
      setErrors({ name: validation.errors[0] });
      return;
    }

    // Check if tag already exists
    if (tags.some((t) => t.name.toLowerCase() === tagName.toLowerCase())) {
      setErrors({ name: '标签已存在' });
      return;
    }

    const newTag = createTag({ name: tagName, color: tagColor });
    addTag(newTag);
    resetForm();
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setErrors({});
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;

    // Validate
    const validation = validateTag({ name: tagName, color: tagColor });
    if (!validation.valid) {
      setErrors({ name: validation.errors[0] });
      return;
    }

    // Check if tag name conflicts with other tags
    const conflict = tags.find(
      (t) => t.id !== editingTag.id && t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (conflict) {
      setErrors({ name: '标签名称已存在' });
      return;
    }

    updateTag(editingTag.id, { name: tagName, color: tagColor });
    resetForm();
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm('确定要删除这个标签吗？')) {
      deleteTag(tagId);
      if (editingTag?.id === tagId) {
        resetForm();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="标签管理" size="md">
      <div className="space-y-6">
        {/* Add/Edit Tag Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {editingTag ? '编辑标签' : '新建标签'}
          </h3>

          <div className="flex gap-3">
            <Input
              placeholder="标签名称"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              icon={<TagIcon className="w-4 h-4" />}
              error={errors.name}
              className="flex-1"
            />

            <input
              type="color"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border-0"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={editingTag ? handleUpdateTag : handleAddTag}
              icon={editingTag ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="flex-1"
            >
              {editingTag ? '更新标签' : '添加标签'}
            </Button>
            {editingTag && (
              <Button
                variant="ghost"
                onClick={resetForm}
                icon={<X className="w-4 h-4" />}
              >
                取消
              </Button>
            )}
          </div>
        </div>

        {/* Tags List */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            已有标签 ({tags.length})
          </h3>

          {tags.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              暂无标签
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tag.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        使用 {tag.usageCount} 次
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 className="w-4 h-4" />}
                      onClick={() => handleEditTag(tag)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onClose}>关闭</Button>
      </div>
    </Modal>
  );
};
