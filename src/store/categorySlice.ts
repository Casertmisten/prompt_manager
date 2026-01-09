import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Tag } from '../types/category';
import { generateId } from '../utils/fileHandler';

interface CategoryState {
  categories: Category[];
  tags: Tag[];
  expandedIds: string[];

  // Category actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryExpanded: (id: string) => void;

  // Tag actions
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      tags: [],
      expandedIds: [],

      setCategories: (categories) => set({ categories }),

      addCategory: (category) =>
        set((state) => {
          const newCategory: Category = {
            ...category,
            id: category.id || generateId(),
          };
          return {
            categories: [...state.categories, newCategory],
          };
        }),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      toggleCategoryExpanded: (id) =>
        set((state) => ({
          expandedIds: state.expandedIds.includes(id)
            ? state.expandedIds.filter((i) => i !== id)
            : [...state.expandedIds, id],
        })),

      setTags: (tags) => set({ tags }),

      addTag: (tag) =>
        set((state) => {
          // Check if tag already exists
          const exists = state.tags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase());
          if (exists) return state;

          return {
            tags: [...state.tags, tag],
          };
        }),

      updateTag: (id, updates) =>
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTag: (id) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
        })),

      getTagByName: (name) => {
        return get().tags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
      },
    }),
    {
      name: 'category-storage',
      partialize: (state) => ({
        categories: state.categories,
        tags: state.tags,
      }),
    }
  )
);
