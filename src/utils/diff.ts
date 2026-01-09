import { diff_match_patch } from 'diff-match-patch';

const dmp = new diff_match_patch();

export interface DiffResult {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

/**
 * 比较两个版本的文本内容
 * @param oldContent 旧版本内容
 * @param newContent 新版本内容
 * @returns 差异结果数组
 */
export function compareVersions(
  oldContent: string,
  newContent: string
): DiffResult[] {
  const diffs = dmp.diff_main(oldContent, newContent);
  dmp.diff_cleanupSemantic(diffs);

  return diffs.map(([type, text]) => ({
    type: type === -1 ? 'delete' : type === 1 ? 'insert' : 'equal',
    text,
  }));
}

/**
 * 生成文本的校验和
 * @param content 文本内容
 * @returns 校验和字符串
 */
export function generateChecksum(content: string): string {
  return dmp.diff_main(content, content).toString();
}

/**
 * 判断两个版本是否相同
 * @param content1 内容1
 * @param content2 内容2
 * @returns 是否相同
 */
export function isVersionEqual(content1: string, content2: string): boolean {
  return content1 === content2;
}

/**
 * 格式化差异结果用于显示（并排视图）
 * @param diffs 差异结果
 * @returns 格式化后的差异
 */
export function formatDiffsForDisplay(diffs: DiffResult[]) {
  // 左边：显示版本1的完整内容，不做颜色标记
  // 右边：显示版本2的完整内容，用颜色标记差异
  const leftLines: string[] = [];
  const rightLines: Array<{ text: string; type: 'equal' | 'insert' | 'delete' }> = [];

  diffs.forEach((diff) => {
    const lines = diff.text.split('\n');
    const endIndex = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

    for (let i = 0; i < endIndex; i++) {
      const line = lines[i];

      if (diff.type === 'equal') {
        leftLines.push(line);
        rightLines.push({ text: line, type: 'equal' });
      } else if (diff.type === 'delete') {
        leftLines.push(line);
        // 左边删除的行，右边标记为删除（灰色+红色背景）
        rightLines.push({ text: line, type: 'delete' });
      } else if (diff.type === 'insert') {
        // 左边新增的行，左边不显示
        rightLines.push({ text: line, type: 'insert' });
      }
    }
  });

  return {
    leftLines,
    rightLines,
  };
}
