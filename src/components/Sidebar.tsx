import { Home, BookOpen, FileText, Target, Calendar } from 'lucide-react';
import { useAppStore, type ViewType } from '@/store/appStore';
import { cn } from '@/lib/utils';

const navItems: { id: ViewType; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'editor', label: 'Editor', icon: FileText },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

export function Sidebar() {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <div className="w-16 lg:w-56 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4">
        <h1 className="hidden lg:block text-xl font-bold text-sidebar-foreground">
          KarNa
        </h1>
        <span className="lg:hidden text-xl font-bold text-sidebar-foreground text-center block">
          K
        </span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                'nav-item w-full',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="hidden lg:block text-xs text-sidebar-foreground/60">
          <p>KarNa Productivity</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
