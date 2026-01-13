import React, { useState, useEffect } from 'react';
import { Edit, Trash2, ArrowLeft, Clock, Tag, FileText, History, Eye, Edit3, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import type { Prompt, Version } from '../../types/prompt';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui';
import { VersionHistory } from './VersionHistory';
import { VersionDiffViewer } from './VersionDiffViewer';
import { useUIStore } from '../../store/uiSlice';
import { usePromptStore } from '../../store';

interface PromptViewerProps {
  prompt: Prompt;
  onBack?: () => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({
  prompt,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { showToast } = useUIStore();
  const { prompts } = usePromptStore();
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [diffVersions, setDiffVersions] = useState<[Version | null, Version | null]>([null, null]);
  const [outputEffect, setOutputEffect] = useState(prompt.outputEffect || '');
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for no animation
  const [animatingVersion, setAnimatingVersion] = useState<string | null>(null); // Track which version is animating

  // 从 store 中获取最新的 prompt 数据
  const latestPrompt = prompts.find(p => p.id === prompt.id) || prompt;

  const [currentVersionIndex, setCurrentVersionIndex] = useState(() => {
    if (!latestPrompt.versions || latestPrompt.versions.length === 0) {
      return 0;
    }
    const index = latestPrompt.versions.findIndex(v => v.version === latestPrompt.currentVersion);
    return index === -1 ? latestPrompt.versions.length - 1 : index;
  });

  // 当 prompt.currentVersion 改变时，更新 currentVersionIndex
  useEffect(() => {
    if (!latestPrompt.versions || latestPrompt.versions.length === 0) {
      setCurrentVersionIndex(0);
      return;
    }
    const index = latestPrompt.versions.findIndex(v => v.version === latestPrompt.currentVersion);
    setCurrentVersionIndex(index === -1 ? latestPrompt.versions.length - 1 : index);
  }, [latestPrompt.currentVersion, latestPrompt.versions]);

  // 获取当前显示的版本
  const currentVersion = latestPrompt.versions?.[currentVersionIndex] || latestPrompt.versions?.[0];

  // 如果版本数据无效，显示错误
  if (!currentVersion || !latestPrompt.versions || latestPrompt.versions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
            版本数据错误
          </h2>
          <p className="text-red-700 dark:text-red-300">
            此提示词没有有效的版本数据。
          </p>
        </div>
      </div>
    );
  }

  // 切换到上一个版本
  const handlePreviousVersion = () => {
    if (currentVersionIndex > 0) {
      setDirection(-1);
      setAnimatingVersion(currentVersion.version);
      setTimeout(() => {
        setCurrentVersionIndex(currentVersionIndex - 1);
      }, 50);
    }
  };

  // 切换到下一个版本
  const handleNextVersion = () => {
    if (currentVersionIndex < latestPrompt.versions.length - 1) {
      setDirection(1);
      setAnimatingVersion(currentVersion.version);
      setTimeout(() => {
        setCurrentVersionIndex(currentVersionIndex + 1);
      }, 50);
    }
  };

  const handleViewDiff = (v1: Version, v2: Version) => {
    setDiffVersions([v1, v2]);
  };

  // 复制当前版本的提示词内容
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(currentVersion.content);
      console.log('[PromptViewer] Content copied to clipboard');
      // 显示复制成功提示
      showToast({
        message: '复制成功',
        type: 'success',
        duration: 2000,
      });
    } catch (err) {
      console.error('[PromptViewer] Failed to copy content:', err);
      // 显示复制失败提示
      showToast({
        message: '复制失败',
        type: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {latestPrompt.title}
              </h1>
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                版本 {currentVersion.version} / {latestPrompt.versions.length}
              </span>
            </div>
            {latestPrompt.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {latestPrompt.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<History className="w-4 h-4" />}
              onClick={() => setIsVersionHistoryOpen(true)}
            >
              版本历史
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Copy className="w-4 h-4" />}
              onClick={handleCopyContent}
            >
              复制
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit?.(latestPrompt)}
            >
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => onDelete?.(latestPrompt)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              删除
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>创建于 {formatDate(latestPrompt.createdAt, 'YYYY-MM-DD HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>当前版本创建于 {formatDate(currentVersion.createdAt, 'YYYY-MM-DD HH:mm')}</span>
        </div>
        {currentVersion.changeLog && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{currentVersion.changeLog}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {latestPrompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {latestPrompt.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg"
            >
              <Tag className="w-4 h-4" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative mb-6">
        {/* 左侧箭头按钮 */}
        <button
          onClick={handlePreviousVersion}
          disabled={currentVersionIndex === 0}
          className={`
            absolute left-[-40px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white dark:bg-gray-800
            border-2 border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700
            hover:border-gray-400 dark:hover:border-gray-500
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-lg
          `}
          title={`上一个版本 (版本 ${currentVersionIndex > 0 ? latestPrompt.versions[currentVersionIndex - 1].version : 'N/A'})`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 提示词内容框 - 带切换动画 */}
        <div className="relative h-[500px] overflow-hidden">
          {animatingVersion && currentVersion.version !== animatingVersion ? (
            <div className="absolute inset-0 flex items-center" style={{ gap: '20px' }}>
              {/* 旧版本卡片 */}
              <motion.div
                key={`prev-${animatingVersion}`}
                initial={{ x: '0%' }}
                animate={{ x: `${-direction * 100}%` }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                className="absolute left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 overflow-y-auto"
                style={{ height: '100%' }}
              >
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-white leading-relaxed">
                  {latestPrompt.versions.find(v => v.version === animatingVersion)?.content || ''}
                </pre>
              </motion.div>

              {/* 新版本卡片 */}
              <motion.div
                key={`new-${currentVersion.version}`}
                initial={{ x: `${direction * 100}%` }}
                animate={{ x: '0%' }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                className="absolute left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 overflow-y-auto"
                style={{ height: '100%' }}
                onAnimationComplete={() => setAnimatingVersion(null)}
              >
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-white leading-relaxed">
                  {currentVersion.content}
                </pre>
              </motion.div>
            </div>
          ) : (
            <motion.div
              key={currentVersion.version}
              initial={false}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 overflow-y-auto"
            >
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-white leading-relaxed">
                {currentVersion.content}
              </pre>
            </motion.div>
          )}
        </div>

        {/* 右侧箭头按钮 */}
        <button
          onClick={handleNextVersion}
          disabled={currentVersionIndex === latestPrompt.versions.length - 1}
          className={`
            absolute right-[-40px] top-1/2 -translate-y-1/2 translate-x-1/2 z-10
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white dark:bg-gray-800
            border-2 border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700
            hover:border-gray-400 dark:hover:border-gray-500
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-lg
          `}
          title={`下一个版本 (版本 ${currentVersionIndex < latestPrompt.versions.length - 1 ? latestPrompt.versions[currentVersionIndex + 1].version : 'N/A'})`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Output Effect */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">输出效果</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={isPreviewMode ? "primary" : "ghost"}
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setIsPreviewMode(true)}
            >
              预览
            </Button>
            <Button
              variant={!isPreviewMode ? "primary" : "ghost"}
              size="sm"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsPreviewMode(false)}
            >
              编辑
            </Button>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="min-h-[200px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            {outputEffect.trim() ? (
              <div className="prose prose-gray dark:prose-invert max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {outputEffect}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                暂无输出效果示例，请点击编辑按钮添加内容
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={outputEffect}
            onChange={(e) => setOutputEffect(e.target.value)}
            placeholder="在这里输入输出效果的markdown内容...&#10;&#10;支持语法：&#10;- # 标题&#10;- **粗体** 和 *斜体*&#10;- - 列表&#10;- `代码`&#10;- ```代码块```&#10;- [链接](url)"
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Version History Modal */}
      <VersionHistory
        isOpen={isVersionHistoryOpen}
        prompt={latestPrompt}
        onClose={() => setIsVersionHistoryOpen(false)}
        onViewDiff={handleViewDiff}
      />

      {/* Version Diff Viewer Modal */}
      {diffVersions[0] && diffVersions[1] && (
        <VersionDiffViewer
          isOpen={true}
          version1={diffVersions[0]}
          version2={diffVersions[1]}
          prompt={latestPrompt}
          onClose={() => setDiffVersions([null, null])}
        />
      )}
    </div>
  );
};
