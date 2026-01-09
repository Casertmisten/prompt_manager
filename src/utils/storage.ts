/**
 * 从localStorage获取数据
 * @param key 存储键
 * @returns 解析后的数据或null
 */
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
}

/**
 * 保存数据到localStorage
 * @param key 存储键
 * @param data 要保存的数据
 * @returns 是否成功
 */
export function saveToLocalStorage<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * 从localStorage删除数据
 * @param key 存储键
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

/**
 * 清空所有localStorage数据
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * 获取localStorage使用情况
 * @returns 使用的字节数
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * 检查localStorage是否接近限制
 * @param threshold 阈值（0-1），默认0.9
 * @returns 是否接近限制
 */
export function isStorageQuotaExceeded(threshold: number = 0.9): boolean {
  const size = getLocalStorageSize();
  const maxSize = 5 * 1024 * 1024; // ~5MB typical limit
  return size >= maxSize * threshold;
}
