import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as LabelComponent } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  Plus
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  getYear,
  setYear,
  getMonth,
  setMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';

type CalendarView = 'month' | 'year';

interface DayBlockProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  goals: ReturnType<typeof useAppStore.getState>['goals'];
  tasks: ReturnType<typeof useAppStore.getState>['calendarTasks'];
  onClick: (date: Date) => void;
}

function DayBlock({ date, isCurrentMonth, isToday, goals, tasks, onClick }: DayBlockProps) {
  const dayGoals = goals.filter((goal) => {
    const deadline = typeof goal.deadline === 'string' ? parseISO(goal.deadline) : goal.deadline;
    return isSameDay(deadline, date);
  });
  
  const dayTasks = tasks.filter((task) => {
    const taskDate = typeof task.date === 'string' ? parseISO(task.date) : task.date;
    return isSameDay(taskDate, date);
  });
  
  const hasDeadline = dayGoals.length > 0;
  const hasTask = dayTasks.length > 0;

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        'calendar-block clay-3d aspect-square p-2',
        'flex flex-col items-start justify-start',
        'transition-all duration-200',
        !isCurrentMonth && 'opacity-40',
        isToday && 'ring-2 ring-primary ring-offset-2',
        'hover:scale-105 active:scale-95'
      )}
    >
      <span className={cn(
        'text-sm font-medium',
        isToday ? 'text-primary' : 'text-foreground'
      )}>
        {format(date, 'd')}
      </span>
      
      <div className="flex-1 w-full flex items-end justify-center gap-1 flex-wrap">
        {hasDeadline && (
          <div className="w-2 h-2 rounded-full bg-red-400" title={`${dayGoals.length} deadline(s)`} />
        )}
        {hasTask && (
          <div className="w-2 h-2 rounded-full bg-blue-400" title={`${dayTasks.length} task(s)`} />
        )}
        {dayGoals.map((g, i) => (
          g.status === 'done' && (
            <div key={i} className="w-2 h-2 rounded-full bg-green-400" />
          )
        ))}
      </div>
    </button>
  );
}

export function CalendarView() {
  const { goals, calendarTasks, addCalendarTask } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [yearRange, setYearRange] = useState(getYear(new Date()));

  // Generate years for selector (50 years past/future)
  const years = useMemo(() => {
    const currentYear = getYear(new Date());
    return Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  }, []);

  // Month view calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days: Date[] = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentDate]);

  // Year view months
  const yearMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i);
  }, []);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setYearRange(yearRange - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setYearRange(yearRange + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsTaskDialogOpen(true);
  };

  const handleAddTask = () => {
    if (selectedDate && newTaskTitle.trim()) {
      addCalendarTask({
        date: selectedDate,
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle('');
      setIsTaskDialogOpen(false);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    setCurrentDate(setMonth(setYear(new Date(), yearRange), monthIndex));
    setViewMode('month');
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {viewMode === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : yearRange
            }
          </h2>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Year Selector */}
          <Select 
            value={yearRange.toString()} 
            onValueChange={(v) => setYearRange(parseInt(v))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-none"
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === 'year' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('year')}
              className="rounded-none"
            >
              <Target className="w-4 h-4 mr-1" />
              Year
            </Button>
          </div>
        </div>
      </div>
      
      {/* Calendar Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        {viewMode === 'month' ? (
          <div className="max-w-5xl mx-auto">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-3 mb-3">
              {weekDays.map((day) => (
                <div 
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((date, index) => (
                <DayBlock
                  key={index}
                  date={date}
                  isCurrentMonth={isSameMonth(date, currentDate)}
                  isToday={isSameDay(date, new Date())}
                  goals={goals}
                  tasks={calendarTasks}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Year View */
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {yearMonths.map((monthIndex) => {
                const monthDate = setMonth(setYear(new Date(), yearRange), monthIndex);
                const monthGoals = goals.filter((goal) => {
                  const deadline = typeof goal.deadline === 'string' 
                    ? parseISO(goal.deadline) 
                    : goal.deadline;
                  return getYear(deadline) === yearRange && getMonth(deadline) === monthIndex;
                });
                
                return (
                  <button
                    key={monthIndex}
                    onClick={() => handleMonthClick(monthIndex)}
                    className={cn(
                      'clay-3d p-6 rounded-2xl text-left',
                      'transition-all duration-200',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {format(monthDate, 'MMMM')}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{monthGoals.length} deadlines</span>
                    </div>
                    {monthGoals.length > 0 && (
                      <div className="mt-3 flex gap-1 flex-wrap">
                        {monthGoals.slice(0, 5).map((goal, i) => (
                          <div 
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              goal.status === 'done' ? 'bg-green-400' : 'bg-red-400'
                            )}
                          />
                        ))}
                        {monthGoals.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{monthGoals.length - 5}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="px-6 py-3 border-t border-border bg-background/50">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-muted-foreground">Goal Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">Calendar Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Existing items for this date */}
            {selectedDate && (
              <div className="space-y-2">
                <LabelComponent>Goals Due</LabelComponent>
                {goals.filter((g) => {
                  const deadline = typeof g.deadline === 'string' 
                    ? parseISO(g.deadline) 
                    : g.deadline;
                  return isSameDay(deadline, selectedDate);
                }).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-2 p-2 bg-accent/50 rounded">
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-sm">{goal.title}</span>
                  </div>
                ))}
                
                {calendarTasks.filter((t) => {
                  const taskDate = typeof t.date === 'string' 
                    ? parseISO(t.date) 
                    : t.date;
                  return isSameDay(taskDate, selectedDate);
                }).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-accent/50 rounded">
                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div>
              <LabelComponent>Add New Task</LabelComponent>
              <div className="flex gap-2">
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button onClick={handleAddTask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
