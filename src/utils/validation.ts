import { Prompt, Category, Tag } from '../types';

/**
 * 验证提示词数据
 * @param prompt 提示词对象
 * @returns 验证结果 { valid: boolean, errors: string[] }
 */
export function validatePrompt(prompt: Partial<Prompt>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!prompt.title || prompt.title.trim().length === 0) {
    errors.push('标题不能为空');
  } else if (prompt.title.length > 200) {
    errors.push('标题不能超过200个字符');
  }

  if (!prompt.content || prompt.content.trim().length === 0) {
    errors.push('内容不能为空');
  }

  if (prompt.description && prompt.description.length > 500) {
    errors.push('描述不能超过500个字符');
  }

  if (!Array.isArray(prompt.tags)) {
    errors.push('标签必须是数组');
  } else if (prompt.tags.some((tag) => typeof tag !== 'string')) {
    errors.push('标签必须是字符串');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证分类数据
 * @param category 分类对象
 * @returns 验证结果
 */
export function validateCategory(category: Partial<Category>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!category.name || category.name.trim().length === 0) {
    errors.push('分类名称不能为空');
  } else if (category.name.length > 100) {
    errors.push('分类名称不能超过100个字符');
  }

  if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
    errors.push('颜色格式无效，应为十六进制格式（如 #FF0000）');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证标签数据
 * @param tag 标签对象
 * @returns 验证结果
 */
export function validateTag(tag: Partial<Tag>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!tag.name || tag.name.trim().length === 0) {
    errors.push('标签名称不能为空');
  } else if (tag.name.length > 50) {
    errors.push('标签名称不能超过50个字符');
  }

  if (tag.color && !/^#[0-9A-Fa-f]{6}$/.test(tag.color)) {
    errors.push('颜色格式无效');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证UUID格式
 * @param uuid UUID字符串
 * @returns 是否有效
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 清理字符串（移除多余空格）
 * @param str 字符串
 * @returns 清理后的字符串
 */
export function cleanString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * 检查字符串是否为空
 * @param str 字符串
 * @returns 是否为空
 */
export function isEmptyString(str: string | undefined | null): boolean {
  return !str || str.trim().length === 0;
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 强度等级 0-4
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength;
}
