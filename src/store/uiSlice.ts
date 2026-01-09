import { create } from 'zustand';
import { Theme, Toast } from '../types';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  modalOpen: boolean;
  toast: Toast | null;
  toasts: Toast[];

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setModalOpen: (open: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  sidebarCollapsed: false,
  modalOpen: false,
  toast: null,
  toasts: [],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setModalOpen: (open) => set({ modalOpen: open }),

  showToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toast: newToast,
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 3000);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toast: state.toast?.id === id ? null : state.toast,
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
