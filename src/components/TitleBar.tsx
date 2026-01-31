import { Minus, Square, X, Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';

export function TitleBar() {
  const { themeMode, toggleTheme } = useAppStore();

  return (
    <div className="title-bar bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground/80 ml-2">KarNa</span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 no-drag"
          onClick={toggleTheme}
        >
          {themeMode === 'light' ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
        </Button>
        
        {/* Window Controls */}
        <div className="title-bar-controls flex items-center gap-1.5 ml-2">
          <button className="title-bar-btn bg-yellow-500 hover:bg-yellow-600">
            <Minus className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
          <button className="title-bar-btn bg-green-500 hover:bg-green-600">
            <Square className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
          <button className="title-bar-btn bg-red-500 hover:bg-red-600">
            <X className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
