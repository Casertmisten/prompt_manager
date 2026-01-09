import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 扩展dayjs以支持相对时间
dayjs.extend(relativeTime);

/**
 * 格式化时间戳为可读日期
 * @param timestamp 时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  timestamp: number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  return dayjs(timestamp).format(format);
}

/**
 * 获取相对时间（如"2小时前"）
 * @param timestamp 时间戳
 * @returns 相对时间字符串
 */
export function getRelativeTime(timestamp: number): string {
  return dayjs(timestamp).fromNow();
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
}

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param keyword 关键词
 * @param className 高亮类名
 * @returns 带高亮标记的HTML字符串
 */
export function highlightKeyword(
  text: string,
  keyword: string,
  className: string = 'bg-yellow-200'
): string {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * 生成随机颜色
 * @returns 十六进制颜色代码
 */
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 计算文本的字数
 * @param text 文本
 * @returns 字数
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * 计算文本的字符数
 * @param text 文本
 * @param countSpaces 是否计算空格
 * @returns 字符数
 */
export function countCharacters(text: string, countSpaces: boolean = true): number {
  return countSpaces ? text.length : text.replace(/\s/g, '').length;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 清理HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * 转义HTML特殊字符
 * @param text 文本
 * @returns 转义后的文本
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
