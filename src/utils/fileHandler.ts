import { saveAs } from 'file-saver';
import { Prompt, Category, Tag } from '../types';

/**
 * 导出数据为JSON文件
 * @param data 要导出的数据
 * @param filename 文件名
 */
export function exportToJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, filename);
}

/**
 * 导出数据为CSV文件
 * @param prompts 提示词数组
 * @param filename 文件名
 */
export function exportToCSV(prompts: Prompt[], filename: string) {
  // CSV header
  const headers = ['ID', 'Title', 'Content', 'Tags', 'Category', 'Created At', 'Updated At'];

  // CSV rows
  const rows = prompts.map((prompt) => [
    prompt.id,
    prompt.title,
    `"${prompt.content.replace(/"/g, '""')}"`, // Escape quotes
    prompt.tags.join(';'),
    prompt.categoryId || '',
    new Date(prompt.createdAt).toISOString(),
    new Date(prompt.updatedAt).toISOString(),
  ]);

  // Combine header and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, filename);
}

/**
 * 从JSON文件导入数据
 * @param file 文件对象
 * @returns Promise<Prompt[]>
 */
export async function importFromJSON<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * 下载文本内容
 * @param content 文本内容
 * @param filename 文件名
 * @param mimeType MIME类型
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
) {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

/**
 * 生成唯一ID
 * @returns UUID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 验证导入的数据
 * @param data 要验证的数据
 * @returns 是否有效
 */
export function validateImportData(data: any): data is Prompt[] {
  if (!Array.isArray(data)) return false;

  return data.every(
    (item) =>
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.content === 'string' &&
      Array.isArray(item.tags)
  );
}