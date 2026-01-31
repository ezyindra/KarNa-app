import { useAppStore } from '@/store/appStore';

interface PlantProps {
  growth: number; // 0-100
  type: 'flower' | 'succulent' | 'fern';
  color: string;
}

function Plant({ growth, type, color }: PlantProps) {
  const isBlooming = growth >= 80;
  const stemHeight = Math.max(20, growth * 1.2);
  const leafScale = Math.min(1, growth / 50);
  
  if (type === 'flower') {
    return (
      <div className="relative flex flex-col items-center justify-end h-32 w-16">
        {/* Flower Bloom */}
        {isBlooming && (
          <div 
            className="absolute top-0 plant-bloom z-10"
            style={{ color }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <circle cx="16" cy="8" r="6" />
              <circle cx="24" cy="16" r="6" />
              <circle cx="16" cy="24" r="6" />
              <circle cx="8" cy="16" r="6" />
              <circle cx="16" cy="16" r="5" fill="#FFD700" />
            </svg>
          </div>
        )}
        
        {/* Stem */}
        <div 
          className="plant-stem w-1 bg-green-500 rounded-full"
          style={{ height: `${stemHeight}px` }}
        />
        
        {/* Leaves */}
        <div 
          className="absolute bottom-8 -left-3 plant-leaf"
          style={{ transform: `scale(${leafScale})` }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <ellipse cx="10" cy="6" rx="10" ry="6" fill="#4ADE80" />
          </svg>
        </div>
        <div 
          className="absolute bottom-12 -right-3 plant-leaf"
          style={{ transform: `scaleX(-1) scale(${leafScale})` }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <ellipse cx="10" cy="6" rx="10" ry="6" fill="#4ADE80" />
          </svg>
        </div>
        
        {/* Pot */}
        <div className="w-8 h-6 bg-amber-700 rounded-b-lg mt-1" />
      </div>
    );
  }
  
  if (type === 'succulent') {
    return (
      <div className="relative flex flex-col items-center justify-end h-28 w-16">
        {/* Succulent Leaves */}
        <div 
          className="relative plant-leaf"
          style={{ transform: `scale(${leafScale})` }}
        >
          <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
            <ellipse cx="24" cy="30" rx="8" ry="6" fill={color} />
            <ellipse cx="16" cy="24" rx="8" ry="6" fill={color} opacity="0.9" />
            <ellipse cx="32" cy="24" rx="8" ry="6" fill={color} opacity="0.9" />
            <ellipse cx="24" cy="18" rx="7" ry="5" fill={color} opacity="0.8" />
            <ellipse cx="18" cy="14" rx="6" ry="4" fill={color} opacity="0.7" />
            <ellipse cx="30" cy="14" rx="6" ry="4" fill={color} opacity="0.7" />
            <ellipse cx="24" cy="10" rx="5" ry="3" fill={color} opacity="0.6" />
          </svg>
        </div>
        
        {/* Pot */}
        <div className="w-7 h-5 bg-stone-600 rounded-b-md mt-1" />
      </div>
    );
  }
  
  // Fern
  return (
    <div className="relative flex flex-col items-center justify-end h-32 w-16">
      {/* Fern Fronds */}
      <div 
        className="plant-leaf"
        style={{ transform: `scale(${leafScale})` }}
      >
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
          <path 
            d="M20 60 Q20 40 10 20 Q15 25 20 20 Q25 25 30 20 Q20 40 20 60" 
            fill="#22C55E" 
          />
          <path 
            d="M20 50 Q12 35 8 15 Q12 20 16 15 Q14 30 20 50" 
            fill="#22C55E" 
            opacity="0.8"
          />
          <path 
            d="M20 50 Q28 35 32 15 Q28 20 24 15 Q26 30 20 50" 
            fill="#22C55E" 
            opacity="0.8"
          />
        </svg>
      </div>
      
      {/* Pot */}
      <div className="w-8 h-6 bg-amber-800 rounded-b-lg mt-1" />
    </div>
  );
}

export function FlowGarden() {
  const { completedTasksToday } = useAppStore();
  
  // Calculate growth based on completed tasks (max 10 tasks = 100%)
  const growth = Math.min(100, (completedTasksToday / 10) * 100);
  
  const plants: PlantProps[] = [
    { growth, type: 'flower', color: '#E8B4B8' },
    { growth: Math.max(0, growth - 20), type: 'succulent', color: '#B8D4E8' },
    { growth: Math.max(0, growth - 10), type: 'fern', color: '#B8E8D4' },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Flow Garden</h3>
          <p className="text-sm text-muted-foreground">
            Your plants grow as you complete tasks
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{completedTasksToday}</span>
          <p className="text-xs text-muted-foreground">tasks today</p>
        </div>
      </div>
      
      <div className="flex items-end justify-center gap-8 py-6 bg-accent/30 rounded-lg">
        {plants.map((plant, index) => (
          <Plant key={index} {...plant} />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Complete more tasks to help your garden bloom!</span>
        <span>{growth.toFixed(0)}% growth</span>
      </div>
    </div>
  );
}
