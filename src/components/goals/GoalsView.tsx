import { useState } from 'react';
import { useAppStore, type GoalStatus, type GoalLabel } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as LabelComponent } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Calendar, Tag, Trash2, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const COLUMNS: { id: GoalStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

const DEFAULT_LABELS: GoalLabel[] = ['Work', 'Personal'];

interface SortableGoalCardProps {
  goal: ReturnType<typeof useAppStore.getState>['goals'][0];
  onDelete: (id: string) => void;
}

function SortableGoalCard({ goal, onDelete }: SortableGoalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deadline = typeof goal.deadline === 'string' 
    ? parseISO(goal.deadline) 
    : goal.deadline;

  const isOverdue = deadline < new Date() && goal.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'kanban-card group',
        isDragging && 'shadow-xl'
      )}
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-0.5"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{goal.title}</p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className={cn(
              'flex items-center gap-1',
              isOverdue && 'text-destructive font-medium'
            )}>
              <Calendar className="w-3 h-3" />
              {format(deadline, 'MMM d')}
            </span>
            
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {goal.label}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function GoalsView() {
  const { goals, addGoal, deleteGoal, moveGoal, customLabels, addCustomLabel } = useAppStore();
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalLabel, setNewGoalLabel] = useState<GoalLabel>('Work');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const goalId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column) {
      moveGoal(goalId, column.id);
      return;
    }

    // Check if dropped on another goal (find its column)
    const overGoal = goals.find((g) => g.id === overId);
    if (overGoal && overGoal.id !== goalId) {
      moveGoal(goalId, overGoal.status);
    }
  };

  const handleCreateGoal = () => {
    if (newGoalTitle.trim() && newGoalDeadline) {
      const label = newGoalLabel === '__custom__' ? newCustomLabel : newGoalLabel;
      if (newGoalLabel === '__custom__' && newCustomLabel) {
        addCustomLabel(newCustomLabel);
      }
      
      addGoal({
        title: newGoalTitle.trim(),
        deadline: new Date(newGoalDeadline),
        label: label as GoalLabel,
        status: 'todo',
      });
      
      setNewGoalTitle('');
      setNewGoalDeadline('');
      setNewGoalLabel('Work');
      setNewCustomLabel('');
      setIsNewGoalOpen(false);
    }
  };

  const allLabels = [...DEFAULT_LABELS, ...customLabels];

  const activeGoal = activeId ? goals.find((g) => g.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Goals</h2>
          <p className="text-sm text-muted-foreground">
            {goals.filter(g => g.status === 'done').length} of {goals.length} completed
          </p>
        </div>
        
        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div>
                <LabelComponent>Title</LabelComponent>
                <Input
                  placeholder="What do you want to achieve?"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
              </div>
              
              <div>
                <LabelComponent>Deadline</LabelComponent>
                <Input
                  type="date"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                />
              </div>
              
              <div>
                <LabelComponent>Label</LabelComponent>
                <Select 
                  value={newGoalLabel} 
                  onValueChange={(v) => setNewGoalLabel(v as GoalLabel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allLabels.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Create New Label</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newGoalLabel === '__custom__' && (
                <div>
                  <LabelComponent>New Label Name</LabelComponent>
                  <Input
                    placeholder="Enter label name..."
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                  />
                </div>
              )}
              
              <Button 
                onClick={handleCreateGoal}
                className="w-full"
                disabled={!newGoalTitle.trim() || !newGoalDeadline}
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <div className="flex gap-6 min-w-max h-full">
            {COLUMNS.map((column) => {
              const columnGoals = goals.filter((g) => g.status === column.id);
              
              return (
                <div 
                  key={column.id}
                  className="w-80 flex flex-col"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', column.color)} />
                      <h3 className="font-semibold text-foreground">{column.label}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({columnGoals.length})
                      </span>
                    </div>
                  </div>
                  
                  {/* Column Drop Zone */}
                  <div
                    id={column.id}
                    className={cn(
                      'kanban-column flex-1',
                      'transition-colors duration-200'
                    )}
                  >
                    <SortableContext
                      items={columnGoals.map((g) => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnGoals.map((goal) => (
                        <SortableGoalCard
                          key={goal.id}
                          goal={goal}
                          onDelete={deleteGoal}
                        />
                      ))}
                    </SortableContext>
                    
                    {columnGoals.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeGoal ? (
            <div className="kanban-card shadow-xl rotate-2">
              <p className="text-sm font-medium text-foreground">{activeGoal.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(
                    typeof activeGoal.deadline === 'string' 
                      ? parseISO(activeGoal.deadline) 
                      : activeGoal.deadline,
                    'MMM d'
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {activeGoal.label}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
