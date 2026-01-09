# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Manager is a React-based web application for managing, organizing, and versioning AI prompts. It features hierarchical categories, tag-based organization, version history with diff viewing, and import/export capabilities.

**Tech Stack:**
- React 19 with TypeScript
- Vite for build tooling
- Zustand for state management
- Tailwind CSS for styling
- React Markdown + Syntax Highlighter for prompt rendering
- Framer Motion for animations

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### State Management (Zustand)

The app uses three Zustand stores with localStorage persistence:

1. **`usePromptStore`** (`src/store/promptSlice.ts`)
   - Manages prompts array, search term, and filters
   - Key actions: `addPrompt`, `updatePrompt`, `deletePrompt`, `toggleFavorite`
   - Version management: `addVersion`, `restoreVersion`
   - Persistence key: `prompt-storage`

2. **`useCategoryStore`** (`src/store/categorySlice.ts`)
   - Manages hierarchical categories and tags
   - Key actions: `addCategory`, `updateCategory`, `deleteCategory`
   - Tag deduplication in `addTag` (case-insensitive)
   - Persistence key: `category-storage`

3. **`useUIStore`** (`src/store/uiSlice.ts`)
   - Manages UI state (theme, sidebar collapse, toasts)
   - Not persisted (except theme to localStorage directly)

### Data Models

**Prompt** (`src/types/prompt.ts`):
- Each prompt has a `versions` array tracking content history
- `currentVersion` indicates which version is active
- Content changes create new versions automatically
- Supports favorites, tags, and category assignment

**Category** (`src/types/category.ts`):
- Hierarchical via `parentId` field
- Each has `promptCount` and `order` for sorting

**Version**:
- Stores `content`, `changeLog`, `createdAt`, and `checksum`
- Checksum used for diff visualization

### Key Services

- **`promptService.ts`**: CRUD operations, version management, search/filter
- **`exportService.ts`**: Export to JSON/CSV/MD with `file-saver`
- **`categoryService.ts`**: Category CRUD helpers
- **`importService.ts`**: Import from JSON backup files

### Component Structure

**Layout** (`src/components/layout/`):
- `MainLayout`: Main wrapper with Header + Sidebar + content area
- `Sidebar`: Category tree navigation, tag manager access
- `Header`: Global actions (export/import, theme toggle)

**Prompt Components** (`src/components/prompt/`):
- `PromptList`: Grid view of prompt cards
- `PromptCard`: Single prompt with actions (edit/delete/favorite/copy)
- `PromptEditor`: Form for create/edit with version control logic
- `PromptViewer`: Detail view with version history tab
- `VersionHistory`: List of versions with restore capability
- `VersionDiffViewer`: Shows diffs between versions using `diff-match-patch`

**Category Components** (`src/components/category/`):
- `CategoryTree`: Recursive tree with expand/collapse
- `CategoryEditor`: Modal for create/edit
- `TagManager`: Tag CRUD interface

### View Flow

The main app (`src/App.tsx`) manages two views:
- **List view**: Shows filtered prompts as cards
- **View mode**: Shows single prompt with version history

State for creating vs editing prompts:
- `isEditing` flag distinguishes modes
- `selectedPrompt` is set when editing, null when creating
- Version creation only happens when content actually changes

### Version Control Pattern

When updating prompt content:
1. Check if `updatedFields.content !== selectedPrompt.content`
2. If true, pass `createNewVersion=true` to `updatePrompt`
3. Service creates new Version object and increments `currentVersion`
4. Old versions preserved in `versions` array for history

### Storage Strategy

- Zustand persist middleware saves to localStorage
- Storage utility helpers in `src/utils/storage.ts`
- Import/export creates full backup JSON with all data

## Important Implementation Details

1. **Version Diffs**: Uses `diff-match-patch` library for computing character-level differences between versions

2. **Search**: Searches across title, content, description, and tags (case-insensitive)

3. **Markdown Rendering**: Prompts rendered with `react-markdown` + `react-syntax-highlighter` for code blocks

4. **ID Generation**: Uses `nanoid`-like utility from `src/utils/fileHandler.ts`

5. **Theme**: Dark mode via Tailwind `dark:` classes, toggled on `html` element

6. **Toast System**: Custom toast notifications managed through `useUIStore` with auto-dismiss

7. **Form Handling**: Uses `react-hook-form` for editor forms with validation
