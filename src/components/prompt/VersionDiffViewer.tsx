import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, FileText } from 'lucide-react';
import { Version, Prompt } from '../../types/prompt';
import { compareVersions, formatDiffsForDisplay } from '../../utils/diff';
import { Button, Modal } from '../ui';

interface VersionDiffViewerProps {
  isOpen: boolean;
  version1: Version;
  version2: Version;
  prompt: Prompt; // 新增：传入整个 prompt 对象以获取所有版本
  onClose: () => void;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  isOpen,
  version1,
  version2,
  prompt,
  onClose,
}) => {
  const [diffs, setDiffs] = useState<any>({});
  const [selectedV1, setSelectedV1] = useState<Version | null>(null);
  const [selectedV2, setSelectedV2] = useState<Version | null>(null);
  const leftPanelRef = React.useRef<HTMLDivElement>(null);
  const rightPanelRef = React.useRef<HTMLDivElement>(null);

  // 同步滚动
  const handleScroll = (side: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    const target = side === 'left' ? rightPanelRef.current : leftPanelRef.current;
    if (target) {
      const percentage = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
      const targetScrollTop = percentage * (target.scrollHeight - target.clientHeight);
      target.scrollTop = targetScrollTop;
    }
  };

  // 当传入的版本改变时，同步到选择状态
  useEffect(() => {
    if (version1 && version2) {
      setSelectedV1(version1);
      setSelectedV2(version2);
    }
  }, [version1, version2, isOpen]);

  // 当选择的版本改变时，计算 diff
  useEffect(() => {
    if (selectedV1 && selectedV2) {
      console.log('[VersionDiffViewer] Computing diff');
      console.log('[VersionDiffViewer] Version 1:', selectedV1);
      console.log('[VersionDiffViewer] Version 1 content length:', selectedV1.content.length);
      console.log('[VersionDiffViewer] Version 1 content:', selectedV1.content);
      console.log('[VersionDiffViewer] Version 2:', selectedV2);
      console.log('[VersionDiffViewer] Version 2 content length:', selectedV2.content.length);
      console.log('[VersionDiffViewer] Version 2 content:', selectedV2.content);

      const result = compareVersions(selectedV1.content, selectedV2.content);
      console.log('[VersionDiffViewer] Diff result:', result);

      const formatted = formatDiffsForDisplay(result);
      console.log('[VersionDiffViewer] Formatted leftLines:', formatted.leftLines);
      console.log('[VersionDiffViewer] Formatted rightLines:', formatted.rightLines);

      setDiffs(formatted as any);
    }
  }, [selectedV1, selectedV2]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="版本对比" size="full">
      <div className="space-y-4 flex flex-col h-full">
        {/* Header - 版本选择下拉框 */}
        <div className="flex items-end gap-4 text-sm">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择版本 A
            </label>
            <select
              value={selectedV1?.id || ''}
              onChange={(e) => {
                const version = prompt.versions.find((v) => v.id === e.target.value);
                setSelectedV1(version || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {prompt.versions.map((version) => (
                <option key={version.id} value={version.id}>
                  版本 {version.version} - {new Date(version.createdAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400 mb-2" />

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择版本 B
            </label>
            <select
              value={selectedV2?.id || ''}
              onChange={(e) => {
                const version = prompt.versions.find((v) => v.id === e.target.value);
                setSelectedV2(version || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {prompt.versions.map((version) => (
                <option key={version.id} value={version.id}>
                  版本 {version.version} - {new Date(version.createdAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
                  </div>
        
                        {/* Diff Content - 增大区域 */}
        
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto min-h-[600px]">
        
                          {!selectedV1 || !selectedV2 ? (
        
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        
                              请选择两个版本进行对比
        
                            </div>
        
                          ) : selectedV1.content === selectedV2.content ? (
        
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        
                              两个版本内容完全相同
        
                            </div>
        
                          ) : (
        
                            <div className="grid grid-cols-2 gap-4 h-full">
              <div
                ref={leftPanelRef}
                onScroll={handleScroll('left')}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 overflow-auto overflow-x-auto"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    版本 {selectedV1.version}
                  </span>
                </div>
                <div className="space-y-0">
                  {diffs.leftLines?.map((line: string, i: number) => (
                    <div
                      key={i}
                      className="text-sm font-mono py-1 px-2 rounded whitespace-nowrap min-h-[1.5em] text-gray-700 dark:text-gray-300"
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={rightPanelRef}
                onScroll={handleScroll('right')}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 overflow-auto overflow-x-auto"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    版本 {selectedV2.version}
                  </span>
                </div>
                <div className="space-y-0">
                  {diffs.rightLines?.map((line: any, i: number) => (
                    <div
                      key={i}
                      className={`
                        text-sm font-mono py-1 px-2 rounded
                        whitespace-nowrap min-h-[1.5em]
                        ${line.type === 'insert'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200 border-l-2 border-green-500'
                          : line.type === 'delete'
                          ? 'bg-red-100 dark:bg-red-900/20 text-gray-500 dark:text-gray-400 border-l-2 border-red-500'
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      {line.text || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 border-l-2 border-red-500" />
            <span>删除</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 border-l-2 border-green-500" />
            <span>添加</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onClose}>关闭</Button>
      </div>
    </Modal>
  );
};
