import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store';

interface MainLayoutProps {
  children: React.ReactNode;
  onExport?: () => void;
  onImport?: () => void;
  selectedCategory: { id: string; name: string } | null;
  onCategorySelect: (category: { id: string; name: string } | null) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onExport,
  onImport,
  selectedCategory,
  onCategorySelect,
}) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Header onExport={onExport} onImport={onImport} />
      <div className="flex-1 flex overflow-hidden">
        {!sidebarCollapsed && <Sidebar selectedCategory={selectedCategory} onCategorySelect={onCategorySelect} />}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
