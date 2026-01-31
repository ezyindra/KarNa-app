import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 'home' | 'library' | 'editor' | 'goals' | 'calendar';
export type ThemeMode = 'light' | 'dark';
export type EditorPaper = 'white' | 'sepia' | 'cool-grey' | 'oled';
export type GoalStatus = 'todo' | 'in-progress' | 'done';
export type GoalLabel = 'Work' | 'Personal' | string;

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
}

export interface QuickThought {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  deadline: Date;
  label: GoalLabel;
  status: GoalStatus;
  createdAt: Date;
}

export interface CalendarTask {
  id: string;
  date: Date;
  title: string;
  goalId?: string;
}

export interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Theme
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Editor
  currentDocument: Document | null;
  setCurrentDocument: (doc: Document | null) => void;
  editorPaper: EditorPaper;
  setEditorPaper: (paper: EditorPaper) => void;
  
  // Documents
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  // Quick Thoughts
  quickThoughts: QuickThought[];
  addQuickThought: (content: string) => void;
  deleteQuickThought: (id: string) => void;
  convertThoughtToDocument: (thoughtId: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  moveGoal: (id: string, newStatus: GoalStatus) => void;
  
  // Calendar Tasks
  calendarTasks: CalendarTask[];
  addCalendarTask: (task: Omit<CalendarTask, 'id'>) => void;
  deleteCalendarTask: (id: string) => void;
  
  // Flow Garden
  completedTasksToday: number;
  incrementCompletedTasks: () => void;
  
  // Custom Labels
  customLabels: string[];
  addCustomLabel: (label: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),
      
      // Theme
      themeMode: 'light',
      toggleTheme: () => set((state) => ({ 
        themeMode: state.themeMode === 'light' ? 'dark' : 'light' 
      })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      
      // Editor
      currentDocument: null,
      setCurrentDocument: (doc) => set({ currentDocument: doc }),
      editorPaper: 'white',
      setEditorPaper: (paper) => set({ editorPaper: paper }),
      
      // Documents
      documents: [],
      addDocument: (doc) => {
        const newDoc: Document = {
          ...doc,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          size: new Blob([doc.content]).size,
        };
        set((state) => ({ documents: [newDoc, ...state.documents] }));
      },
      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id
              ? { ...d, ...updates, updatedAt: new Date(), size: updates.content ? new Blob([updates.content]).size : d.size }
              : d
          ),
        }));
      },
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },
      
      // Quick Thoughts
      quickThoughts: [],
      addQuickThought: (content) => {
        const newThought: QuickThought = {
          id: crypto.randomUUID(),
          content,
          createdAt: new Date(),
        };
        set((state) => ({ quickThoughts: [newThought, ...state.quickThoughts] }));
      },
      deleteQuickThought: (id) => {
        set((state) => ({
          quickThoughts: state.quickThoughts.filter((t) => t.id !== id),
        }));
      },
      convertThoughtToDocument: (thoughtId) => {
        const thought = get().quickThoughts.find((t) => t.id === thoughtId);
        if (thought) {
          const newDoc: Document = {
            id: crypto.randomUUID(),
            title: thought.content.slice(0, 50) + (thought.content.length > 50 ? '...' : ''),
            content: thought.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            size: new Blob([thought.content]).size,
          };
          set((state) => ({
            documents: [newDoc, ...state.documents],
            quickThoughts: state.quickThoughts.filter((t) => t.id !== thoughtId),
          }));
        }
      },
      
      // Goals
      goals: [],
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },
      moveGoal: (id, newStatus) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, status: newStatus } : g
          ),
        }));
        if (newStatus === 'done') {
          get().incrementCompletedTasks();
        }
      },
      
      // Calendar Tasks
      calendarTasks: [],
      addCalendarTask: (task) => {
        const newTask: CalendarTask = {
          ...task,
          id: crypto.randomUUID(),
        };
        set((state) => ({ calendarTasks: [...state.calendarTasks, newTask] }));
      },
      deleteCalendarTask: (id) => {
        set((state) => ({
          calendarTasks: state.calendarTasks.filter((t) => t.id !== id),
        }));
      },
      
      // Flow Garden
      completedTasksToday: 0,
      incrementCompletedTasks: () => {
        set((state) => ({ completedTasksToday: state.completedTasksToday + 1 }));
      },
      
      // Custom Labels
      customLabels: [],
      addCustomLabel: (label) => {
        set((state) => ({
          customLabels: [...state.customLabels, label],
        }));
      },
    }),
    {
      name: 'karna-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        documents: state.documents,
        quickThoughts: state.quickThoughts,
        goals: state.goals,
        calendarTasks: state.calendarTasks,
        completedTasksToday: state.completedTasksToday,
        customLabels: state.customLabels,
      }),
    }
  )
);
