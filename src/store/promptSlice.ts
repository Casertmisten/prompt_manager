import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt, PromptFilters } from '../types/prompt';
import { updatePrompt as updatePromptService } from '../services/promptService';

interface PromptState {
  prompts: Prompt[];
  selectedId: string | null;
  searchTerm: string;
  filters: PromptFilters;

  // Actions
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>, createNewVersion?: boolean) => void;
  deletePrompt: (id: string) => void;
  selectPrompt: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: PromptFilters) => void;
  toggleFavorite: (id: string) => void;

  // Version management
  addVersion: (promptId: string, version: any) => void;
  restoreVersion: (promptId: string, versionId: string) => void;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      selectedId: null,
      searchTerm: '',
      filters: {
        tags: [],
      },

      setPrompts: (prompts) => set({ prompts }),

      addPrompt: (prompt) =>
        set((state) => ({
          prompts: [...state.prompts, prompt],
        })),

      updatePrompt: (id, updates, createNewVersion = false) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id
              ? updatePromptService(p, updates, createNewVersion)
              : p
          ),
        })),

      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      selectPrompt: (id) => set({ selectedId: id }),

      setSearchTerm: (term) => set({ searchTerm: term }),

      setFilters: (filters) => set({ filters }),

      toggleFavorite: (id) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        })),

      addVersion: (promptId, version) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === promptId
              ? {
                  ...p,
                  versions: [...p.versions, version],
                  currentVersion: p.versions.length,
                }
              : p
          ),
        })),

      restoreVersion: (promptId, versionId) =>
        set((state) => {
          const prompts = state.prompts.map((p) => {
            if (p.id !== promptId) return p;

            const version = p.versions.find((v) => v.id === versionId);
            if (!version) return p;

            return {
              ...p,
              content: version.content,
              currentVersion: version.version,
            };
          });

          return { prompts };
        }),
    }),
    {
      name: 'prompt-storage',
      partialize: (state) => ({
        prompts: state.prompts,
      }),
    }
  )
);
