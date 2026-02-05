import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as LabelComponent } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Target,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
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
} from "date-fns";
import { cn } from "@/lib/utils";

interface DayBlockProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  goals: ReturnType<typeof useAppStore.getState>["goals"];
  tasks: ReturnType<typeof useAppStore.getState>["calendarTasks"];
  onClick: (date: Date) => void;
}

function DayBlock({
  date,
  isCurrentMonth,
  isToday,
  goals,
  tasks,
  onClick,
}: DayBlockProps) {
  const dayGoals = goals.filter((goal) => {
    const deadline =
      typeof goal.deadline === "string"
        ? parseISO(goal.deadline)
        : goal.deadline;
    return isSameDay(deadline, date);
  });

  const dayTasks = tasks.filter((task) => {
    const taskDate =
      typeof task.date === "string" ? parseISO(task.date) : task.date;
    return isSameDay(taskDate, date);
  });

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        "calendar-block clay-3d aspect-square p-2 relative transform-gpu rounded-sm group",
        "flex flex-col items-start justify-start",
        "transition-all duration-200",
        "hover:-translate-y-3 hover:z-10 hover:scale-[1.06] hover:!shadow-lg hover:!shadow-black/40 hover:!bg-neutral-900",
        !isCurrentMonth && "opacity-40",
        isToday && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <span className={cn("text-sm font-medium", isToday && "text-primary")}>
        {format(date, "d")}
      </span>

      <div className="flex-1 w-full flex items-end justify-center gap-1 flex-wrap">
        {dayGoals.length > 0 && <div className="w-2 h-2 bg-red-400 rounded-full" />}
        {dayTasks.length > 0 && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
        {dayGoals.map(
          (g, i) =>
            g.status === "done" && (
              <div key={i} className="w-2 h-2 bg-green-400 rounded-full" />
            )
        )}
      </div>

      {/* Hover Add Hint */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition text-xs text-muted-foreground flex items-center gap-1 pointer-events-none">
        <Plus className="w-3 h-3" />
        Add
      </div>
    </button>
  );
}

export function CalendarView() {
  const {
    goals,
    calendarTasks,
    addCalendarTask,
    updateCalendarTask,
    deleteCalendarTask,
  } = useAppStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const MIN_YEAR = 2026;

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

  const handlePrev = () => {
    const prev = subMonths(currentDate, 1);
    if (getYear(prev) >= MIN_YEAR) setCurrentDate(prev);
  };

  const handleNext = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!selectedDate || !newTaskTitle.trim()) return;

    if (editingTaskId) {
      updateCalendarTask(editingTaskId, newTaskTitle.trim());
      setEditingTaskId(null);
    } else {
      addCalendarTask({ date: selectedDate, title: newTaskTitle.trim() });
    }

    setNewTaskTitle("");
  };

  const tasksForDay = selectedDate
    ? calendarTasks.filter((t) =>
        isSameDay(
          typeof t.date === "string" ? parseISO(t.date) : t.date,
          selectedDate
        )
      )
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-7 gap-3 overflow-visible">
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
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && `Tasks for ${format(selectedDate, "MMMM d, yyyy")}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {tasksForDay.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{task.title}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingTaskId(task.id);
                    setNewTaskTitle(task.title);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteCalendarTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <LabelComponent>{editingTaskId ? "Edit Task" : "Add Task"}</LabelComponent>
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTask()}
              />
              <Button onClick={handleSaveTask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
