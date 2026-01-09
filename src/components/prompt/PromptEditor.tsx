import React, { useState, useEffect } from 'react';
import { Save, Folder } from 'lucide-react';
import { Prompt, PromptFilters } from '../../types/prompt';
import { createPrompt } from '../../services/promptService';
import { validatePrompt } from '../../utils/validation';
import { Button, Input, Textarea, Modal } from '../ui';
import { TagSelector } from '../category';
import { useCategoryStore } from '../../store';

interface PromptEditorProps {
  isOpen: boolean;
  prompt?: Prompt | null;
  isEditing?: boolean;
  defaultCategoryId?: string | null;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  isOpen,
  prompt,
  isEditing,
  defaultCategoryId,
  onClose,
  onSave,
}) => {
  const { categories } = useCategoryStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or prompt changes
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description || '');
      setSelectedTags(prompt.tags || []);
      setCategoryId(prompt.categoryId || '');
    } else if (isEditing) {
      // 编辑模式：保持当前值
      // 不重置表单，保留用户正在编辑的内容
    } else {
      // 新建模式：重置表单，使用传入的默认分类
      setTitle('');
      setContent('');
      setDescription('');
      setSelectedTags([]);
      setCategoryId(defaultCategoryId || '');
      setErrors({});
    }
  }, [prompt, isOpen, isEditing, defaultCategoryId]);

  const handleSave = () => {
    console.log('[PromptEditor] handleSave called');
    console.log('[PromptEditor] isEditing:', isEditing);
    console.log('[PromptEditor] prompt:', prompt);
    console.log('[PromptEditor] title:', title);
    console.log('[PromptEditor] content:', content);
    console.log('[PromptEditor] content length:', content.length);

    // Validate
    const validation = validatePrompt({ title, content, description, tags: selectedTags });
    if (!validation.valid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error) => {
        if (error.includes('标题')) errorMap.title = error;
        else if (error.includes('内容')) errorMap.content = error;
        else if (error.includes('描述')) errorMap.description = error;
        else if (error.includes('标签')) errorMap.tags = error;
      });
      setErrors(errorMap);
      return;
    }

    // Save or update prompt
    const now = Date.now();

    if (isEditing && prompt) {
      // 编辑模式：使用原有的更新逻辑
      const promptData: Prompt = {
        ...prompt,
        title,
        content,
        description: description || undefined,
        tags: selectedTags,
        categoryId: categoryId || undefined,
        updatedAt: now,
      };
      console.log('[PromptEditor] Editing mode, calling onSave with partial updates');
      onSave(promptData);
    } else {
      // 新建模式：使用 createPrompt 创建完整的提示词（包含初始版本）
      const newPrompt = createPrompt({
        title,
        content,
        description: description || undefined,
        tags: selectedTags,
        categoryId: categoryId || undefined,
      });
      console.log('[PromptEditor] Creating mode, calling onSave with new prompt');
      console.log('[PromptEditor] newPrompt.versions:', newPrompt.versions);
      console.log('[PromptEditor] newPrompt.currentVersion:', newPrompt.currentVersion);
      onSave(newPrompt);
    }

    console.log('[PromptEditor] onSave callback completed');

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prompt ? '编辑提示词' : '新建提示词'}
      size="xl"
    >
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="标题"
          placeholder="输入提示词标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        {/* Description */}
        <Input
          label="描述"
          placeholder="简要描述这个提示词的用途"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            分类
          </label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">未分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            选择一个分类来组织这个提示词（可选）
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            标签
          </label>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            maxTags={5}
          />
          {errors.tags && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
          )}
        </div>

        {/* Content */}
        <Textarea
          label="提示词内容"
          placeholder="输入提示词内容，支持Markdown格式"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={10}
          showCharCount
          maxLength={10000}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>
          {isEditing ? '更新' : '保存'}
        </Button>
      </div>
    </Modal>
  );
};
