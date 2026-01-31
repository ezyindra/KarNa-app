import { useAppStore } from '@/store/appStore';
import { FlowGarden } from './FlowGarden';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

export function HomeDashboard() {
  const { goals, setCurrentView } = useAppStore();
  
  // Get today's priorities (goals due today that aren't done)
  const todaysGoals = goals.filter((goal) => {
    const deadline = typeof goal.deadline === 'string' ? parseISO(goal.deadline) : goal.deadline;
    return isToday(deadline) && goal.status !== 'done';
  });
  
  // Get overdue goals
  const overdueGoals = goals.filter((goal) => {
    const deadline = typeof goal.deadline === 'string' ? parseISO(goal.deadline) : goal.deadline;
    return isPast(deadline) && !isToday(deadline) && goal.status !== 'done';
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, KarNa
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>
      
      {/* Flow Garden */}
      <div className="mb-8">
        <FlowGarden />
      </div>
      
      {/* Today's Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Goals */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Priorities
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentView('goals')}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {todaysGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks due today</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysGoals.map((goal) => (
                <div 
                  key={goal.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                >
                  <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${goal.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {goal.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goal.label}
                    </p>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${goal.status === 'in-progress' 
                      ? 'bg-yellow-500/20 text-yellow-600' 
                      : 'bg-blue-500/20 text-blue-600'}
                  `}>
                    {goal.status === 'in-progress' ? 'In Progress' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Overdue Goals */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-destructive" />
              Overdue
            </h3>
            <span className="text-sm text-muted-foreground">
              {overdueGoals.length} items
            </span>
          </div>
          
          {overdueGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No overdue tasks</p>
              <p className="text-sm">Great job staying on track!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-auto custom-scrollbar">
              {overdueGoals.map((goal) => (
                <div 
                  key={goal.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10"
                >
                  <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {goal.title}
                    </p>
                    <p className="text-xs text-destructive">
                      Due {format(
                        typeof goal.deadline === 'string' ? parseISO(goal.deadline) : goal.deadline,
                        'MMM d'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Goals', value: goals.length },
          { label: 'Completed', value: goals.filter(g => g.status === 'done').length },
          { label: 'In Progress', value: goals.filter(g => g.status === 'in-progress').length },
          { label: 'To Do', value: goals.filter(g => g.status === 'todo').length },
        ].map((stat) => (
          <div 
            key={stat.label}
            className="bg-card rounded-xl p-4 border border-border text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
