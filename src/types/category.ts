// 分类/文件夹数据模型
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  promptCount: number;
  order: number;
}

// 标签数据模型
export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: number;
}
