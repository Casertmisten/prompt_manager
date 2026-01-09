export * from './prompt';
export * from './category';

// UI相关类型
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
}

// 主题类型
export type Theme = 'light' | 'dark';
