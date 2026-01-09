declare module 'diff-match-patch' {
  export const diff_match_patch: any;
  export interface DiffMatchPatch {
    diff_main: (text1: string, text2: string) => [number, string][];
    diff_cleanupSemantic: (diffs: [number, string][]) => void;
    diff_prettyHtml: (diffs: [number, string][], ...args: any[]) => string;
    diff_prettyText: (diffs: [number, string][], ...args: any[]) => string;
    diff_cleanupEfficiency: (diffs: [number, string][]) => void;
  }
}

declare module 'file-saver' {
  export function saveAs(blob: Blob, filename: string): void;
}
