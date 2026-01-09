import React, { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Modal } from '../ui';
import type { ImportResult } from '../../services/importService';
import { importFromJSONFile } from '../../services/importService';
import { usePromptStore, useCategoryStore, useUIStore } from '../../store';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { setPrompts } = usePromptStore();
  const { setCategories, setTags } = useCategoryStore();
  const { showToast } = useUIStore();

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // 检查文件类型
      if (!droppedFile.name.endsWith('.json')) {
        showToast({
          type: 'error',
          message: '仅支持 JSON 格式文件',
        });
        return;
      }
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const importResult = await importFromJSONFile(file);
      setResult(importResult);

      if (importResult.success) {
        showToast({
          type: 'success',
          message: `成功导入 ${importResult.imported.prompts} 个提示词`,
        });

        // Reload data from localStorage
        const promptStorage = localStorage.getItem('prompt-storage');
        const categoryStorage = localStorage.getItem('category-storage');

        if (promptStorage) {
          const promptData = JSON.parse(promptStorage);
          setPrompts(promptData.state?.prompts || []);
        }

        if (categoryStorage) {
          const categoryData = JSON.parse(categoryStorage);
          setCategories(categoryData.state?.categories || []);
          setTags(categoryData.state?.tags || []);
        }

        setTimeout(() => {
          onImportSuccess?.();
          onClose();
        }, 2000);
      } else {
        showToast({
          type: 'error',
          message: '导入失败，请检查文件格式',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : '导入失败',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setIsDragging(false);
    setDragCounter(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="导入数据" size="md">
      <div className="space-y-4">
        {!result && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              选择要导入的 JSON 备份文件。文件应该包含提示词、分类和标签数据。
            </p>

            {/* File Upload Zone with Drag & Drop */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-900 dark:text-white mb-2">
                {isDragging ? '松开鼠标即可导入' : '点击选择文件或拖拽 JSON 文件到此处'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                仅支持 JSON 格式备份文件
              </p>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </Button>
            </div>

            {/* Selected File */}
            {file && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  ✕
                </button>
              </div>
            )}
          </>
        )}

        {/* Import Result */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                导入完成
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">提示词:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.imported.prompts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">分类:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.imported.categories}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">标签:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.imported.tags}
                </span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  错误 ({result.errors.length})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 dark:text-red-400">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  警告 ({result.warnings.length})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-600 dark:text-yellow-400">
                      • {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!result && (
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button
            icon={<Upload className="w-4 h-4" />}
            onClick={handleImport}
            disabled={!file || importing}
            loading={importing}
          >
            {importing ? '导入中...' : '导入'}
          </Button>
        </div>
      )}
    </Modal>
  );
};
