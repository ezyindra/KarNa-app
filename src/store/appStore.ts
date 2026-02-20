import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewType = 'home' | 'library' | 'editor' | 'goals' | 'calendar'
export type ThemeMode = 'light' | 'dark'
export type EditorPaper = 'white' | 'sepia' | 'cool-grey' | 'oled'
export type GoalStatus = 'todo' | 'in-progress' | 'done'
export type GoalLabel = 'Work' | 'Personal' | string

export interface Document {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  size: number
}

export interface QuickThought {
  id: string
  content: string
  createdAt: number
}

export interface Goal {
  id: string
  title: string
  deadline: number
  label: GoalLabel
  status: GoalStatus
  createdAt: number
}

export interface CalendarTask {
  id: string
  date: number
  title: string
  goalId?: string
}

export interface AppState {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  themeMode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void

  currentDocument: Document | null
  setCurrentDocument: (doc: Document | null) => void

  editorPaper: EditorPaper
  setEditorPaper: (paper: EditorPaper) => void

  documents: Document[]
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void

  quickThoughts: QuickThought[]
  addQuickThought: (content: string) => void
  deleteQuickThought: (id: string) => void
  convertThoughtToDocument: (thoughtId: string) => void

  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  moveGoal: (id: string, newStatus: GoalStatus) => void

  calendarTasks: CalendarTask[]
  addCalendarTask: (task: Omit<CalendarTask, 'id'>) => void
  updateCalendarTask: (id: string, title: string) => void
  deleteCalendarTask: (id: string) => void

  completedTasksToday: number
  incrementCompletedTasks: () => void

  customLabels: string[]
  addCustomLabel: (label: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),

      themeMode: 'light',
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),
      setThemeMode: (mode) => set({ themeMode: mode }),

      currentDocument: null,
      setCurrentDocument: (doc) => set({ currentDocument: doc }),

      editorPaper: 'white',
      setEditorPaper: (paper) => set({ editorPaper: paper }),

      documents: [],

      // ✅ CREATE DOCUMENT (auto-open editor)
      addDocument: (doc) => {
        const newDoc: Document = {
          ...doc,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          size: new Blob([doc.content]).size,
        }

        set((state) => ({
          documents: [newDoc, ...state.documents],
          currentDocument: newDoc,
          currentView: 'editor',
        }))
      },

      // ✅ FIXED CORE FUNCTION
      updateDocument: (id, updates) => {
        set((state) => {
          const updatedDocs = state.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...updates,
                  updatedAt: Date.now(),
                  size: updates.content
                    ? new Blob([updates.content]).size
                    : d.size,
                }
              : d
          )

          const updatedCurrent =
            state.currentDocument?.id === id
              ? {
                  ...state.currentDocument,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : state.currentDocument

          return {
            documents: updatedDocs,
            currentDocument: updatedCurrent,
          }
        })
      },

      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          currentDocument:
            state.currentDocument?.id === id ? null : state.currentDocument,
        }))
      },

      quickThoughts: [],
      addQuickThought: (content) => {
        const newThought: QuickThought = {
          id: crypto.randomUUID(),
          content,
          createdAt: Date.now(),
        }

        set((state) => ({
          quickThoughts: [newThought, ...state.quickThoughts],
        }))
      },

      deleteQuickThought: (id) => {
        set((state) => ({
          quickThoughts: state.quickThoughts.filter((t) => t.id !== id),
        }))
      },

      convertThoughtToDocument: (thoughtId) => {
        const thought = get().quickThoughts.find((t) => t.id === thoughtId)

        if (!thought) return

        const newDoc: Document = {
          id: crypto.randomUUID(),
          title:
            thought.content.slice(0, 50) +
            (thought.content.length > 50 ? '...' : ''),
          content: thought.content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          size: new Blob([thought.content]).size,
        }

        set((state) => ({
          documents: [newDoc, ...state.documents],
          quickThoughts: state.quickThoughts.filter((t) => t.id !== thoughtId),
          currentDocument: newDoc,
          currentView: 'editor',
        }))
      },

      goals: [],
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        }

        set((state) => ({
          goals: [...state.goals, newGoal],
        }))
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }))
      },

      moveGoal: (id, newStatus) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, status: newStatus } : g
          ),
        }))

        if (newStatus === 'done') {
          get().incrementCompletedTasks()
        }
      },

      calendarTasks: [],
      addCalendarTask: (task) => {
        const newTask: CalendarTask = {
          ...task,
          id: crypto.randomUUID(),
        }

        set((state) => ({
          calendarTasks: [...state.calendarTasks, newTask],
        }))
      },

      updateCalendarTask: (id, title) => {
        set((state) => ({
          calendarTasks: state.calendarTasks.map((t) =>
            t.id === id ? { ...t, title } : t
          ),
        }))
      },

      deleteCalendarTask: (id) => {
        set((state) => ({
          calendarTasks: state.calendarTasks.filter((t) => t.id !== id),
        }))
      },

      completedTasksToday: 0,
      incrementCompletedTasks: () => {
        set((state) => ({
          completedTasksToday: state.completedTasksToday + 1,
        }))
      },

      customLabels: [],
      addCustomLabel: (label) => {
        set((state) => ({
          customLabels: [...state.customLabels, label],
        }))
      },
    }),
    {
      name: 'karna-storage',
    }
  )
)