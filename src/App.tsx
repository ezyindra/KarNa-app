import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { LibraryView } from '@/components/library/LibraryView';
import { EditorView } from '@/components/editor/EditorView';
import { GoalsView } from '@/components/goals/GoalsView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { cn } from '@/lib/utils';

function App() {
  const { themeMode, currentView } = useAppStore();

  // Apply theme class to document
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeDashboard />;
      case 'library':
        return <LibraryView />;
      case 'editor':
        return <EditorView />;
      case 'goals':
        return <GoalsView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className={cn(
      'h-screen w-screen flex flex-col overflow-hidden',
      'bg-background text-foreground',
      'transition-colors duration-300'
    )}>
      {/* Custom Title Bar */}
      <TitleBar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main View */}
        <main className="flex-1 overflow-hidden bg-background">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
