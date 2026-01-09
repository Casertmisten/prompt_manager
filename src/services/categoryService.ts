import { Category, Tag } from '../types/category';
import { generateId } from '../utils/fileHandler';

/**
 * 创建新分类
 * @param data 分类数据
 * @returns 新分类
 */
export function createCategory(data: {
  name: string;
  parentId?: string;
  color?: string;
}): Category {
  return {
    id: generateId(),
    name: data.name,
    parentId: data.parentId,
    icon: undefined,
    color: data.color || '#000000',
    createdAt: Date.now(),
    promptCount: 0,
    order: 0,
  };
}

/**
 * 更新分类
 * @param category 分类
 * @param updates 更新内容
 * @returns 更新后的分类
 */
export function updateCategory(
  category: Category,
  updates: Partial<Category>
): Category {
  return {
    ...category,
    ...updates,
  };
}

/**
 * 获取分类的所有子分类
 * @param categories 分类数组
 * @param parentId 父分类ID
 * @returns 子分类数组
 */
export function getChildCategories(
  categories: Category[],
  parentId: string | undefined
): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

/**
 * 构建分类树
 * @param categories 分类数组
 * @returns 树形结构
 */
export function buildCategoryTree(categories: Category[]): CategoryTree[] {
  console.log('[buildCategoryTree] Input categories:', categories);

  const map = new Map<string, CategoryTree>();
  const roots: CategoryTree[] = [];

  // 初始化所有节点
  categories.forEach((category) => {
    if (!category.id) {
      console.error('[buildCategoryTree] Category without ID:', category);
      // 不 return，继续处理其他分类
    } else {
      map.set(category.id, { ...category, children: [] });
    }
  });

  // 构建树
  categories.forEach((category) => {
    if (!category.id) {
      return;  // 跳过没有 ID 的分类
    }
    const node = map.get(category.id)!;
    if (category.parentId) {
      const parent = map.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  console.log('[buildCategoryTree] Output tree:', roots);

  return roots;
}

/**
 * 获取分类路径
 * @param categories 分类数组
 * @param categoryId 分类ID
 * @returns 路径数组
 */
export function getCategoryPath(
  categories: Category[],
  categoryId: string
): Category[] {
  const path: Category[] = [];
  let current = categories.find((c) => c.id === categoryId);

  while (current) {
    path.unshift(current);
    if (current.parentId) {
      current = categories.find((c) => c.id === current!.parentId);
    } else {
      current = undefined;
    }
  }

  return path;
}

/**
 * 更新分类的提示词计数
 * @param categories 分类数组
 * @param prompts 提示词数组
 * @returns 更新后的分类数组
 */
export function updateCategoryPromptCount(
  categories: Category[],
  prompts: any[]
): Category[] {
  // 统计每个分类的提示词数量
  const countMap = new Map<string, number>();

  prompts.forEach((prompt) => {
    if (prompt.categoryId) {
      countMap.set(prompt.categoryId, (countMap.get(prompt.categoryId) || 0) + 1);
    }
  });

  // 更新分类
  return categories.map((category) => ({
    ...category,
    promptCount: countMap.get(category.id) || 0,
  }));
}

/**
 * ===== 标签相关函数 =====
 */

/**
 * 创建新标签
 * @param data 标签数据
 * @returns 新标签
 */
export function createTag(data: { name: string; color?: string }): Tag {
  return {
    id: generateId(),
    name: data.name,
    color: data.color || '#3b82f6',
    usageCount: 0,
    createdAt: Date.now(),
  };
}

/**
 * 更新标签
 * @param tag 标签
 * @param updates 更新内容
 * @returns 更新后的标签
 */
export function updateTag(tag: Tag, updates: Partial<Tag>): Tag {
  return {
    ...tag,
    ...updates,
  };
}

/**
 * 获取标签使用统计
 * @param tags 标签数组
 * @param prompts 提示词数组
 * @returns 更新后的标签数组
 */
export function updateTagUsageCount(
  tags: Tag[],
  prompts: any[]
): Tag[] {
  const countMap = new Map<string, number>();

  // 统计每个标签的使用次数
  prompts.forEach((prompt) => {
    prompt.tags.forEach((tagName: string) => {
      countMap.set(tagName, (countMap.get(tagName) || 0) + 1);
    });
  });

  // 更新标签
  return tags.map((tag) => ({
    ...tag,
    usageCount: countMap.get(tag.name) || 0,
  }));
}

/**
 * 查找或创建标签
 * @param tags 标签数组
 * @param tagName 标签名
 * @returns 标签
 */
export function findOrCreateTag(tags: Tag[], tagName: string): Tag {
  let tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());

  if (!tag) {
    tag = createTag({ name: tagName });
    tags.push(tag);
  }

  return tag;
}

/**
 * 删除分类及其子分类
 * @param categories 分类数组
 * @param categoryId 分类ID
 * @returns 更新后的分类数组
 */
export function deleteCategoryRecursive(
  categories: Category[],
  categoryId: string
): Category[] {
  const toDelete = new Set<string>();

  // 找到所有需要删除的分类（包括子分类）
  const findChildren = (id: string) => {
    toDelete.add(id);
    const children = categories.filter((c) => c.parentId === id);
    children.forEach((child) => findChildren(child.id));
  };

  findChildren(categoryId);

  return categories.filter((c) => !toDelete.has(c.id));
}

// CategoryTree 接口定义
export interface CategoryTree extends Category {
  children: CategoryTree[];
}
