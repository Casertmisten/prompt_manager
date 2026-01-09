import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button, Modal } from '../ui';
import { exportAllData } from '../../services/exportService';
import { usePromptStore, useCategoryStore } from '../../store';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { prompts } = usePromptStore();
  const { categories, tags } = useCategoryStore();

  const handleExport = () => {
    exportAllData(prompts, categories, tags);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="导出数据" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          导出完整的提示词数据备份
        </p>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                完整备份 (JSON)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                包含所有提示词、分类和标签数据
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                文件大小: ~{((prompts.length * 2 + categories.length + tags.length) / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• 导出文件格式: JSON</p>
          <p>• 包含所有版本历史记录</p>
          <p>• 可通过导入功能恢复数据</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button icon={<Download className="w-4 h-4" />} onClick={handleExport}>
          导出备份
        </Button>
      </div>
    </Modal>
  );
};
