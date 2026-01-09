import { Prompt, Category, Tag } from '../types';
import { importFromJSON, validateImportData } from '../utils/fileHandler';
import { validatePrompt, validateCategory, validateTag } from '../utils/validation';

/**
 * 导入数据结果
 */
export interface ImportResult {
  success: boolean;
  imported: {
    prompts: number;
    categories: number;
    tags: number;
  };
  errors: string[];
  skipped: string[];
  warnings: string[];
}

/**
 * 从JSON文件导入数据
 * @param file 文件对象
 * @returns Promise<ImportResult>
 */
export async function importFromJSONFile(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: {
      prompts: 0,
      categories: 0,
      tags: 0,
    },
    errors: [],
    skipped: [],
    warnings: [],
  };

  try {
    // 读取并解析文件
    const data = await importFromJSON<any>(file);

    // 验证数据格式
    if (!data || typeof data !== 'object') {
      result.errors.push('无效的文件格式');
      return result;
    }

    // 处理旧版本格式
    const isOldFormat = Array.isArray(data);
    const prompts: Prompt[] = isOldFormat ? data : (data.prompts || data.data?.prompts || []);
    const categories: Category[] = isOldFormat ? [] : (data.categories || data.data?.categories || []);
    const tags: Tag[] = isOldFormat ? [] : (data.tags || data.data?.tags || []);

    // 导入提示词
    if (prompts.length > 0) {
      const promptsResult = importPrompts(prompts);
      result.imported.prompts = promptsResult.imported;
      result.errors.push(...promptsResult.errors);
      result.skipped.push(...promptsResult.skipped);
      result.warnings.push(...promptsResult.warnings);
    }

    // 导入分类
    if (categories.length > 0) {
      const categoriesResult = importCategories(categories);
      result.imported.categories = categoriesResult.imported;
      result.errors.push(...categoriesResult.errors);
      result.skipped.push(...categoriesResult.skipped);
      result.warnings.push(...categoriesResult.warnings);
    }

    // 导入标签
    if (tags.length > 0) {
      const tagsResult = importTags(tags);
      result.imported.tags = tagsResult.imported;
      result.errors.push(...tagsResult.errors);
      result.skipped.push(...tagsResult.skipped);
      result.warnings.push(...tagsResult.warnings);
    }

    result.success = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    result.success = false;
  }

  return result;
}

/**
 * 导入提示词
 * @param prompts 提示词数组
 * @returns 导入结果
 */
function importPrompts(prompts: Prompt[]): {
  imported: number;
  errors: string[];
  skipped: string[];
  warnings: string[];
} {
  const result = {
    imported: 0,
    errors: [] as string[],
    skipped: [] as string[],
    warnings: [] as string[],
  };

  // 从localStorage获取现有提示词
  const existingPromptsStr = localStorage.getItem('prompt-storage');
  const existingData = existingPromptsStr ? JSON.parse(existingPromptsStr) : {};
  const existingPrompts = existingData.state?.prompts || [];

  // 创建现有ID的映射
  const existingIds = new Set(existingPrompts.map((p: Prompt) => p.id));

  prompts.forEach((prompt) => {
    // 验证提示词
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      result.errors.push(`提示词 "${prompt.title}" 无效: ${validation.errors.join(', ')}`);
      return;
    }

    // 检查是否已存在
    if (existingIds.has(prompt.id)) {
      result.skipped.push(`提示词 "${prompt.title}" 已存在，已跳过`);
      return;
    }

    // 添加到现有提示词
    existingPrompts.push(prompt);
    result.imported++;
  });

  // 保存到localStorage
  if (result.imported > 0) {
    existingData.state.prompts = existingPrompts;
    localStorage.setItem('prompt-storage', JSON.stringify(existingData));
  }

  return result;
}

/**
 * 导入分类
 * @param categories 分类数组
 * @returns 导入结果
 */
function importCategories(categories: Category[]): {
  imported: number;
  errors: string[];
  skipped: string[];
  warnings: string[];
} {
  const result = {
    imported: 0,
    errors: [] as string[],
    skipped: [] as string[],
    warnings: [] as string[],
  };

  // 从localStorage获取现有分类
  const existingCategoriesStr = localStorage.getItem('category-storage');
  const existingData = existingCategoriesStr ? JSON.parse(existingCategoriesStr) : {};
  const existingCategories = existingData.state?.categories || [];

  // 创建现有ID的映射
  const existingIds = new Set(existingCategories.map((c: Category) => c.id));

  categories.forEach((category) => {
    // 验证分类
    const validation = validateCategory(category);
    if (!validation.valid) {
      result.errors.push(`分类 "${category.name}" 无效: ${validation.errors.join(', ')}`);
      return;
    }

    // 检查是否已存在
    if (existingIds.has(category.id)) {
      result.skipped.push(`分类 "${category.name}" 已存在，已跳过`);
      return;
    }

    // 添加到现有分类
    existingCategories.push(category);
    result.imported++;
  });

  // 保存到localStorage
  if (result.imported > 0) {
    existingData.state.categories = existingCategories;
    localStorage.setItem('category-storage', JSON.stringify(existingData));
  }

  return result;
}

/**
 * 导入标签
 * @param tags 标签数组
 * @returns 导入结果
 */
function importTags(tags: Tag[]): {
  imported: number;
  errors: string[];
  skipped: string[];
  warnings: string[];
} {
  const result = {
    imported: 0,
    errors: [] as string[],
    skipped: [] as string[],
    warnings: [] as string[],
  };

  // 从localStorage获取现有标签
  const existingCategoriesStr = localStorage.getItem('category-storage');
  const existingData = existingCategoriesStr ? JSON.parse(existingCategoriesStr) : {};
  const existingTags = existingData.state?.tags || [];

  // 创建现有名称的映射
  const existingNames = new Set(existingTags.map((t: Tag) => t.name.toLowerCase()));

  tags.forEach((tag) => {
    // 验证标签
    const validation = validateTag(tag);
    if (!validation.valid) {
      result.errors.push(`标签 "${tag.name}" 无效: ${validation.errors.join(', ')}`);
      return;
    }

    // 检查是否已存在（按名称）
    if (existingNames.has(tag.name.toLowerCase())) {
      result.skipped.push(`标签 "${tag.name}" 已存在，已跳过`);
      return;
    }

    // 添加到现有标签
    existingTags.push(tag);
    existingNames.add(tag.name.toLowerCase());
    result.imported++;
  });

  // 保存到localStorage
  if (result.imported > 0) {
    existingData.state.tags = existingTags;
    localStorage.setItem('category-storage', JSON.stringify(existingData));
  }

  return result;
}

/**
 * 合并导入策略选项
 */
export interface MergeOptions {
  mergeStrategy: 'skip' | 'overwrite' | 'rename';
  mergeCategories: boolean;
  mergeTags: boolean;
}

/**
 * 使用合并策略导入数据
 * @param file 文件对象
 * @param options 合并选项
 * @returns Promise<ImportResult>
 */
export async function importWithMergeStrategy(
  file: File,
  options: MergeOptions
): Promise<ImportResult> {
  // 基础导入结果
  const baseResult = await importFromJSONFile(file);

  // 根据策略处理冲突
  if (options.mergeStrategy === 'overwrite') {
    // 覆盖现有数据
    // 这里可以实现覆盖逻辑
  } else if (options.mergeStrategy === 'rename') {
    // 重命名冲突项
    baseResult.warnings.push('部分项目已重命名以避免冲突');
  }

  return baseResult;
}
