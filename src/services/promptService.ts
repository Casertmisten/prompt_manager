import { Prompt, Version } from '../types/prompt';
import { generateId } from '../utils/fileHandler';
import { generateChecksum } from '../utils/diff';

/**
 * 创建新提示词
 * @param data 提示词数据
 * @returns 新提示提示词
 */
export function createPrompt(data: {
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
}): Prompt {
  const now = Date.now();
  const initialVersion: Version = {
    id: generateId(),
    version: 1,
    content: data.content,
    changeLog: '初始版本',
    createdAt: now,
    checksum: generateChecksum(data.content),
  };

  return {
    id: generateId(),
    title: data.title,
    content: data.content,
    description: data.description,
    tags: data.tags || [],
    categoryId: data.categoryId,
    createdAt: now,
    updatedAt: now,
    versions: [initialVersion],
    currentVersion: 1,
    isFavorite: false,
  };
}

/**
 * 更新提示词内容
 * @param prompt 提示词
 * @param updates 更新内容
 * @param createNewVersion 是否创建新版本
 * @returns 更新后的提示词
 */
export function updatePrompt(
  prompt: Prompt,
  updates: Partial<Prompt>,
  createNewVersion: boolean = true
): Prompt {
  const now = Date.now();

  console.log('[promptService] updatePrompt called');
  console.log('[promptService] prompt.content:', prompt.content);
  console.log('[promptService] prompt.content length:', prompt.content.length);
  console.log('[promptService] updates.content:', updates.content);
  console.log('[promptService] updates.content length:', updates.content?.length);
  console.log('[promptService] prompt.versions.length:', prompt.versions.length);
  console.log('[promptService] createNewVersion:', createNewVersion);

  // 如果需要创建新版本（createNewVersion为true）
  if (createNewVersion) {
    // 使用新内容作为版本内容，而不是旧内容
    const newContent = updates.content || prompt.content;
    const newVersion: Version = {
      id: generateId(),
      version: prompt.versions.length + 1,
      content: newContent,
      changeLog: '内容已更新',
      createdAt: now,
      checksum: generateChecksum(newContent),
    };

    console.log('[promptService] Creating new version with content:', newVersion.content);
    console.log('[promptService] New version content length:', newVersion.content.length);

    // 排除 updates 中的 versions 和 currentVersion 字段，避免覆盖新版本
    const { versions, currentVersion, ...safeUpdates } = updates;

    const updatedPrompt: Prompt = {
      ...prompt,
      ...safeUpdates,
      content: newContent,
      updatedAt: now,
      versions: [...prompt.versions, newVersion],
      currentVersion: newVersion.version,
    };

    console.log('[promptService] Final updatedPrompt.content:', updatedPrompt.content);
    console.log('[promptService] Final updatedPrompt.content length:', updatedPrompt.content.length);
    console.log('[promptService] Final versions.length:', updatedPrompt.versions.length);
    console.log('[promptService] Final currentVersion:', updatedPrompt.currentVersion);

    return updatedPrompt;
  } else {
    // 不创建新版本，只更新其他字段
    return {
      ...prompt,
      ...updates,
      updatedAt: now,
      content: updates.content || prompt.content, // 保持原有内容
    };
  }
}

/**
 * 创建提示词的新版本
 * @param prompt 提示词
 * @param content 新内容
 * @param changeLog 变更说明
 * @returns 更新后的提示词
 */
export function createNewVersion(
  prompt: Prompt,
  content: string,
  changeLog?: string
): Prompt {
  const now = Date.now();
      const newVersion: Version = {
        id: generateId(),
        version: prompt.versions.length + 1,
        content,
        createdAt: now,
        checksum: generateChecksum(content),
      } as Version;
  return {
    ...prompt,
    content,
    versions: [...prompt.versions, newVersion],
    currentVersion: newVersion.version,
    updatedAt: now,
  };
}

/**
 * 恢复到指定版本
 * @param prompt 提示词
 * @param versionId 版本ID
 * @returns 更新后的提示词
 */
export function restoreVersion(prompt: Prompt, versionId: string): Prompt {
  const version = prompt.versions.find((v) => v.id === versionId);
  if (!version) {
    throw new Error('Version not found');
  }

  const now = Date.now();
  const restoreVersion: Version = {
    id: generateId(),
    version: prompt.versions.length + 1,
    content: version.content,
    changeLog: `恢复到版本 ${version.version}`,
    createdAt: now,
    checksum: version.checksum,
  };

  return {
    ...prompt,
    content: version.content,
    versions: [...prompt.versions, restoreVersion],
    currentVersion: restoreVersion.version,
    updatedAt: now,
  };
}

/**
 * 搜索提示词
 * @param prompts 提示词数组
 * @param searchTerm 搜索词
 * @param filters 过滤条件
 * @returns 匹配的提示词
 */
export function searchPrompts(
  prompts: Prompt[],
  searchTerm: string,
  filters?: {
    tags?: string[];
    categoryId?: string;
    isFavorite?: boolean;
  }
): Prompt[] {
  let results = [...prompts];

  // 按搜索词过滤
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(term) ||
        prompt.content.toLowerCase().includes(term) ||
        prompt.description?.toLowerCase().includes(term) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }

  // 按标签过滤
  if (filters?.tags && filters.tags.length > 0) {
    results = results.filter((prompt) =>
      filters.tags!.some((tag) => prompt.tags.includes(tag))
    );
  }

  // 按分类过滤
  if (filters?.categoryId) {
    results = results.filter((prompt) => prompt.categoryId === filters.categoryId);
  }

  // 按收藏过滤
  if (filters?.isFavorite !== undefined) {
    results = results.filter((prompt) => prompt.isFavorite === filters.isFavorite);
  }

  return results;
}

/**
 * 按标签分组提示词
 * @param prompts 提示词数组
 * @returns 标签到提示词的映射
 */
export function groupPromptsByTag(prompts: Prompt[]): Map<string, Prompt[]> {
  const groups = new Map<string, Prompt[]>();

  prompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => {
      if (!groups.has(tag)) {
        groups.set(tag, []);
      }
      groups.get(tag)!.push(prompt);
    });
  });

  return groups;
}

/**
 * 统计提示词
 * @param prompts 提示词数组
 * @returns 统计信息
 */
export function getPromptStats(prompts: Prompt[]): {
  total: number;
  favorites: number;
  byCategory: Map<string, number>;
  byTag: Map<string, number>;
  totalVersions: number;
} {
  const byCategory = new Map<string, number>();
  const byTag = new Map<string, number>();

  prompts.forEach((prompt) => {
    // 按分类统计
    if (prompt.categoryId) {
      byCategory.set(
        prompt.categoryId,
        (byCategory.get(prompt.categoryId) || 0) + 1
      );
    }

    // 按标签统计
    prompt.tags.forEach((tag) => {
      byTag.set(tag, (byTag.get(tag) || 0) + 1);
    });
  });

  const totalVersions = prompts.reduce((sum, p) => sum + p.versions.length, 0);

  return {
    total: prompts.length,
    favorites: prompts.filter((p) => p.isFavorite).length,
    byCategory,
    byTag,
    totalVersions,
  };
}
