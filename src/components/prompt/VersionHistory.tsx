import React, { useState } from 'react';
import { History, RotateCcw, Eye, Trash2 } from 'lucide-react';
import { Prompt, Version } from '../../types/prompt';
import { formatDate } from '../../utils/formatters';
import { usePromptStore } from '../../store';
import { Button, Modal } from '../ui';

interface VersionHistoryProps {
  isOpen: boolean;
  prompt: Prompt;
  onClose: () => void;
  onViewDiff?: (version1: Version, version2: Version) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  isOpen,
  prompt,
  onClose,
  onViewDiff,
}) => {
  const { updatePrompt } = usePromptStore();
  const [selectedVersions, setSelectedVersions] = useState<[Version | null, Version | null]>([null, null]);

  const handleRestore = (versionId: string) => {
    if (confirm('确定要恢复到此版本吗？')) {
      // 找到要恢复的版本
      const versionToRestore = prompt.versions.find(v => v.id === versionId);
      if (versionToRestore) {
        // 只更新 currentVersion，不创建新版本
        updatePrompt(prompt.id, {
          currentVersion: versionToRestore.version,
          content: versionToRestore.content, // 同时更新 content 为当前版本的内容
        }, false); // false 表示不创建新版本
        onClose();
        alert(`已切换到版本 ${versionToRestore.version}`);
      }
    }
  };

  const handleViewDiff = () => {
    if (selectedVersions[0] && selectedVersions[1]) {
      onViewDiff?.(selectedVersions[0], selectedVersions[1]);
    }
  };

  const isCompareEnabled = selectedVersions[0] && selectedVersions[1];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="版本历史" size="xl">
      <div className="space-y-4">
        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            此提示词共有 <strong>{prompt.versions.length}</strong> 个版本，当前使用版本{' '}
            <strong>{prompt.currentVersion}</strong>
          </p>
        </div>

        {/* Compare Button */}
        {isCompareEnabled && (
          <Button
            onClick={handleViewDiff}
            icon={<History className="w-4 h-4" />}
            className="w-full"
          >
            比较两个版本
          </Button>
        )}

        {/* Version List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {prompt.versions.slice().reverse().map((version, index) => {
            const isCurrent = version.version === prompt.currentVersion;
            const isV1Selected = selectedVersions[0]?.id === version.id;
            const isV2Selected = selectedVersions[1]?.id === version.id;

            return (
              <div
                key={version.id}
                className={`
                  p-4 rounded-lg border-2 transition-colors
                  ${isCurrent
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded">
                          当前
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        版本 {version.version}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {version.changeLog || '无变更说明'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(version.createdAt, 'YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Compare Selection */}
                    <button
                      onClick={() => {
                        setSelectedVersions((prev) => {
                          if (prev[0]?.id === version.id) {
                            return [null, prev[1]];
                          }
                          return [version, prev[1]];
                        });
                      }}
                      className={`
                        px-3 py-1.5 text-xs rounded-lg transition-colors
                        ${isV1Selected
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                        }
                      `}
                    >
                      A
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVersions((prev) => {
                          if (prev[1]?.id === version.id) {
                            return [prev[0], null];
                          }
                          return [prev[0], version];
                        });
                      }}
                      className={`
                        px-3 py-1.5 text-xs rounded-lg transition-colors
                        ${isV2Selected
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/40'
                        }
                      `}
                    >
                      B
                    </button>

                    {/* View */}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => {
                        alert(version.content);
                      }}
                    />

                    {/* Restore */}
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<RotateCcw className="w-4 h-4" />}
                        onClick={() => handleRestore(version.id)}
                      >
                        恢复
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>
          关闭
        </Button>
      </div>
    </Modal>
  );
};
