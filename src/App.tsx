import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout';
import { ToastContainer } from './components/ui';
import { PromptList, PromptEditor, PromptViewer } from './components/prompt';
import { ExportDialog, ImportDialog } from './components/export';
import { SearchBar, FilterPanel } from './components/search';
import { useUIStore, usePromptStore } from './store';
import type { Prompt, PromptFilters } from './types/prompt';
import { createPrompt, searchPrompts } from './services/promptService';

function App() {
  const { toasts, removeToast, theme, showToast } = useUIStore();
  const { prompts, setPrompts, addPrompt, updatePrompt, deletePrompt, toggleFavorite, setSearchTerm, searchTerm, filters, setFilters } = usePromptStore();

  const [view, setView] = useState<'list' | 'view'>('list');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false); // 区分新建和编辑模式
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 应用主题
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 计算过滤后的提示词
  const filteredPrompts = searchPrompts(prompts, searchTerm, filters).filter(prompt => {
    if (!selectedCategory) return true;
    return prompt.categoryId === selectedCategory.id;
  });

  // 处理创建提示词
  const handleCreatePrompt = (prompt: Prompt) => {
    addPrompt(prompt);
    setIsEditorOpen(false);
  };

  // 处理更新提示词
  const handleUpdatePrompt = (updatedFields: Partial<Prompt>) => {
    console.log('[App] handleUpdatePrompt called');
    console.log('[App] selectedPrompt:', selectedPrompt);
    console.log('[App] updatedFields:', updatedFields);
    console.log('[App] updatedFields.content:', updatedFields.content);
    console.log('[App] updatedFields.content length:', updatedFields.content?.length);
    console.log('[App] isEditing:', isEditing);

    if (selectedPrompt) {
      console.log('[App] Calling updatePrompt with ID:', selectedPrompt.id);

      // 检查内容是否发生变化，只有内容变化时才创建新版本
      const contentChanged = updatedFields.content !== undefined &&
                             updatedFields.content !== selectedPrompt.content;

      updatePrompt(selectedPrompt.id, updatedFields, contentChanged);
      setIsEditorOpen(false);

      // 使用 getState() 获取更新后的 store 状态
      const latestPrompt = usePromptStore.getState().prompts.find(
        (p) => p.id === selectedPrompt.id
      );
      if (latestPrompt) {
        setSelectedPrompt(latestPrompt);
        setEditingPrompt(latestPrompt);
        console.log('[App] Updated selectedPrompt with latest data from store');
      }
    }
    setIsEditing(false); // 更新完成后重置编辑模式
    console.log('[App] handleUpdatePrompt completed');
  };

  // 处理删除提示词
  const handleDeletePrompt = (prompt: Prompt) => {
    if (confirm(`确定要删除"${prompt.title}"吗？`)) {
      deletePrompt(prompt.id);
      if (selectedPrompt?.id === prompt.id) {
        setSelectedPrompt(null);
        setView('list');
      }
    }
  };

  // 处理选择提示词查看
  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setView('view');
  };

  // 处理复制提示词内容
  const handleCopyPrompt = async (prompt: Prompt) => {
    try {
      // 获取当前版本的内容
      const currentVersion = prompt.versions.find(
        v => v.version === prompt.currentVersion
      );
      if (currentVersion) {
        await navigator.clipboard.writeText(currentVersion.content);
        console.log('[App] Copied prompt content for:', prompt.title);
        // 显示复制成功提示
        showToast({
          message: '复制成功',
          type: 'success',
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('[App] Failed to copy prompt content:', err);
      // 显示复制失败提示
      showToast({
        message: '复制失败',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // 打开编辑器
  const handleOpenEditor = (prompt?: Prompt) => {
    setEditingPrompt(prompt || null);
    if (prompt) {
      setSelectedPrompt(prompt); // 修复：设置selectedPrompt，使handleUpdatePrompt能正常工作
      setIsEditing(true); // 编辑模式
    } else {
      setSelectedPrompt(null);
      setIsEditing(false); // 新建模式
    }
    setIsEditorOpen(true);
  };

  // 返回列表
  const handleBackToList = () => {
    setSelectedPrompt(null);
    setView('list');
    setIsEditing(false); // 重置编辑模式
  };

  // 处理搜索变化
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // 处理过滤器变化
  const handleFiltersChange = (newFilters: PromptFilters) => {
    setFilters(newFilters);
  };

  // 处理分类选择
  const handleCategorySelect = (category: { id: string; name: string } | null) => {
    setSelectedCategory(category);
    setView('list'); // 切换到列表视图
    setSelectedPrompt(null); // 清除选中的提示词
    setIsEditing(false); // 重置编辑模式
  };

  // 添加一些示例数据
  const addSampleData = () => {
    const samplePrompts = [
      createPrompt({
        title: '代码审查助手',
        content: '请审查以下代码，并提供改进建议：\n\n1. 代码质量和可读性\n2. 性能优化建议\n3. 潜在的bug和安全问题\n\n代码：\n{{code}}',
        description: '帮助开发者进行代码审查和优化',
        tags: ['编程', '代码审查', '优化'],
      }),
      createPrompt({
        title: '邮件写作助手',
        content: '请帮我写一封{{email_type}}邮件，内容如下：\n\n收件人：{{recipient}}\n主题：{{subject}}\n\n请保持专业、礼貌的语气，并确保内容清晰简洁。',
        description: '快速生成专业的商务邮件',
        tags: ['写作', '邮件', '商务'],
      }),
      createPrompt({
        title: '学习计划制定',
        content: '请为我制定一个{{duration}}的{{subject}}学习计划：\n\n目标：\n{{goals}}\n\n当前水平：\n{{current_level}}\n\n要求：\n1. 每周学习时间\n2. 分阶段学习目标\n3. 推荐学习资源\n4. 实践项目建议',
        description: '个性化的学习计划生成器',
        tags: ['学习', '计划', '教育'],
      }),
    ];

    setPrompts(samplePrompts);
  };

  return (
    <MainLayout
      selectedCategory={selectedCategory}
      onCategorySelect={handleCategorySelect}
      onExport={() => setIsExportOpen(true)}
      onImport={() => setIsImportOpen(true)}
    >
      {view === 'list' ? (
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory ? selectedCategory.name : '所有提示词'}
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <SearchBar onSearchChange={handleSearchChange} />
            </div>
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>

          {/* Prompt List */}
          <PromptList
            prompts={filteredPrompts}
            onCreate={() => handleOpenEditor()}
            onEdit={(prompt) => handleOpenEditor(prompt)}
            onDelete={handleDeletePrompt}
            onSelect={handleSelectPrompt}
            onCopy={handleCopyPrompt}
          />

          {prompts.length === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={addSampleData}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                添加示例数据
              </button>
            </div>
          )}
        </div>
      ) : selectedPrompt ? (
        <PromptViewer
          prompt={selectedPrompt}
          onBack={handleBackToList}
          onEdit={(prompt) => handleOpenEditor(prompt)}
          onDelete={handleDeletePrompt}
        />
      ) : null}

      {/* Modals */}
      <PromptEditor
        isOpen={isEditorOpen}
        prompt={editingPrompt}
        isEditing={isEditing}
        defaultCategoryId={selectedCategory?.id || null}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPrompt(null);
          setIsEditing(false);
        }}
        onSave={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => setView('list')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </MainLayout>
  );
}

export default App;
