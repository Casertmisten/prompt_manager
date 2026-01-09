// 提示词数据模型
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  categoryId?: string;
  createdAt: number;
  updatedAt: number;
  versions: Version[];
  currentVersion: number;
  isFavorite: boolean;
  language?: string;
  templateVariables?: Variable[];
  outputEffect?: string;
}

// 版本数据模型
export interface Version {
  id: string;
  version: number;
  content: string;
  changeLog?: string;
  createdAt: number;
  createdBy?: string;
  checksum: string;
}

// 模板变量数据模型
export interface Variable {
  name: string;
  defaultValue?: string;
  required: boolean;
  description?: string;
}

// 提示词搜索过滤器
export interface PromptFilters {
  tags: string[];
  categoryId?: string;
  dateRange?: [number, number];
  isFavorite?: boolean;
}
