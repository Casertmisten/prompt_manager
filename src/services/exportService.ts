import type { Prompt, Category, Tag } from '../types';
import { exportToJSON, exportToCSV } from '../utils/fileHandler';
import dayjs from 'dayjs';

/**
 * 导出所有数据为JSON
 * @param prompts 提示词数组
 * @param categories 分类数组
 * @param tags 标签数组
 */
export function exportAllData(
  prompts: Prompt[],
  categories: Category[],
  tags: Tag[]
) {
  const data = {
    version: '1.0',
    exportedAt: dayjs().toISOString(),
    data: {
      prompts,
      categories,
      tags,
    },
  };

  exportToJSON(data, `prompt-manager-backup-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.json`);
}

/**
 * 导出提示词为JSON
 * @param prompts 提示词数组
 * @param filename 文件名（可选）
 */
export function exportPromptsToJSON(prompts: Prompt[], filename?: string) {
  const data = {
    version: '1.0',
    exportedAt: dayjs().toISOString(),
    prompts,
  };

  exportToJSON(data, filename || `prompts-${dayjs().format('YYYY-MM-DD')}.json`);
}

/**
 * 导出提示词为CSV
 * @param prompts 提示词数组
 * @param filename 文件名（可选）
 */
export function exportPromptsToCSV(prompts: Prompt[], filename?: string) {
  exportToCSV(prompts, filename || `prompts-${dayjs().format('YYYY-MM-DD')}.csv`);
}

/**
 * 导出单个提示词为文件
 * @param prompt 提示词
 * @param format 格式 'json' | 'txt' | 'md'
 */
export async function exportPromptToFile(
  prompt: Prompt,
  format: 'json' | 'txt' | 'md' = 'txt'
) {
  const timestamp = dayjs(prompt.createdAt).format('YYYY-MM-DD');
  const safeTitle = prompt.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  const baseFilename = `${safeTitle}-${timestamp}`;

  const fileSaver = await import('file-saver');

  switch (format) {
    case 'json':
      exportToJSON(prompt, `${baseFilename}.json`);
      break;
    case 'md':
      const mdContent = `# ${prompt.title}\n\n${
        prompt.description ? `> ${prompt.description}\n\n` : ''
      }**标签**: ${prompt.tags.join(', ') || '无'}\n\n**创建时间**: ${dayjs(prompt.createdAt).format('YYYY-MM-DD HH:mm:ss')}\n\n---\n\n${prompt.content}`;
      const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
      fileSaver.saveAs(mdBlob, `${baseFilename}.md`);
      break;
    case 'txt':
    default:
      const txtContent = `标题: ${prompt.title}\n描述: ${prompt.description || '无'}\n标签: ${prompt.tags.join(', ') || '无'}\n创建时间: ${dayjs(prompt.createdAt).format('YYYY-MM-DD HH:mm:ss')}\n\n${prompt.content}`;
      const txtBlob = new Blob([txtContent], { type: 'text/plain' });
      fileSaver.saveAs(txtBlob, `${baseFilename}.txt`);
      break;
  }
}

/**
 * 导出分类为JSON
 * @param categories 分类数组
 * @param filename 文件名（可选）
 */
export function exportCategoriesToJSON(categories: Category[], filename?: string) {
  const data = {
    version: '1.0',
    exportedAt: dayjs().toISOString(),
    categories,
  };

  exportToJSON(data, filename || `categories-${dayjs().format('YYYY-MM-DD')}.json`);
}

/**
 * 导出标签为JSON
 * @param tags 标签数组
 * @param filename 文件名（可选）
 */
export function exportTagsToJSON(tags: Tag[], filename?: string) {
  const data = {
    version: '1.0',
    exportedAt: dayjs().toISOString(),
    tags,
  };

  exportToJSON(data, filename || `tags-${dayjs().format('YYYY-MM-DD')}.json`);
}

/**
 * 生成导出报告
 * @param prompts 提示词数组
 * @param categories 分类数组
 * @param tags 标签数组
 * @returns 报告对象
 */
export function generateExportReport(
  prompts: Prompt[],
  categories: Category[],
  tags: Tag[]
) {
  const totalVersions = prompts.reduce((sum, p) => sum + p.versions.length, 0);
  const favoritesCount = prompts.filter((p) => p.isFavorite).length;

  return {
    summary: {
      totalPrompts: prompts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      totalVersions,
      favoritesCount,
    },
    exportDate: dayjs().toISOString(),
  };
}