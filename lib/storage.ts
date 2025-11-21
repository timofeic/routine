import type { AppData, Kid, Task, Routine, TaskCompletion, TaskRecord, WorldRecord, ActiveTimer } from './types';

export type { AppData };

const STORAGE_KEY = 'kids-routine-app-data';
const DATA_VERSION = 1; // Increment this when you make breaking changes

const DEFAULT_KIDS: Kid[] = [
  { id: '1', name: 'Child 1', color: 'bg-blue-500', avatar: '👦' },
  { id: '2', name: 'Child 2', color: 'bg-pink-500', avatar: '👧' },
];

const DEFAULT_ROUTINES: Routine[] = [
  { id: 'morning', name: 'Morning', icon: '☀️', color: 'from-yellow-300 to-orange-400', isDefault: true },
  { id: 'evening', name: 'Evening', icon: '🌙', color: 'from-indigo-500 to-purple-600', isDefault: true },
];

const DEFAULT_TASKS: Task[] = [
  // Morning tasks
  { id: 'm1', name: 'Go to the toilet', icon: '🚽', routineId: 'morning', order: 1 },
  { id: 'm2', name: 'Get changed', icon: '👕', routineId: 'morning', order: 2 },
  { id: 'm3', name: 'Pack bag for school', icon: '🎒', routineId: 'morning', order: 3 },
  { id: 'm4', name: 'Eat breakfast', icon: '🍳', routineId: 'morning', order: 4 },
  { id: 'm5', name: 'Brush teeth', icon: '🪥', routineId: 'morning', order: 5 },
  { id: 'm6', name: 'Say bye to Mum', icon: '👋', routineId: 'morning', order: 6 },
  // Evening tasks
  { id: 'e1', name: 'Clean up the table', icon: '🧹', routineId: 'evening', order: 1 },
  { id: 'e2', name: 'Tidy toys', icon: '🧸', routineId: 'evening', order: 2 },
  { id: 'e3', name: 'Take a bath', icon: '🛁', routineId: 'evening', order: 3 },
  { id: 'e4', name: 'Brush teeth', icon: '🪥', routineId: 'evening', order: 4 },
  { id: 'e5', name: 'Get changed', icon: '🌙', routineId: 'evening', order: 5 },
  { id: 'e6', name: 'Read bedtime story', icon: '📖', routineId: 'evening', order: 6 },
];

function getDefaultData(): AppData {
  return {
    version: DATA_VERSION,
    kids: DEFAULT_KIDS,
    routines: DEFAULT_ROUTINES,
    tasks: DEFAULT_TASKS,
    completions: [],
    personalRecords: [],
    worldRecords: [],
    activeTimers: [],
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultData = getDefaultData();
      saveData(defaultData);
      return defaultData;
    }
    const data = JSON.parse(stored);

    // Check version - if outdated, reset to defaults
    if (!data.version || data.version < DATA_VERSION) {
      console.log(`Data version outdated (${data.version || 0} < ${DATA_VERSION}). Resetting to defaults.`);
      const defaultData = getDefaultData();
      saveData(defaultData);
      return defaultData;
    }

    // Migration: Add routines if missing
    if (!data.routines) {
      data.routines = DEFAULT_ROUTINES;
      // Migrate old tasks to use routineId
      if (data.tasks) {
        data.tasks = data.tasks.map((task: any) => ({
          ...task,
          routineId: task.routineType || task.routineId,
        }));
      }
      saveData(data);
    }

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export function addKid(data: AppData, kid: Kid): AppData {
  return {
    ...data,
    kids: [...data.kids, kid],
  };
}

export function updateKid(data: AppData, kidId: string, updates: Partial<Kid>): AppData {
  return {
    ...data,
    kids: data.kids.map(k => k.id === kidId ? { ...k, ...updates } : k),
  };
}

export function deleteKid(data: AppData, kidId: string): AppData {
  return {
    ...data,
    kids: data.kids.filter(k => k.id !== kidId),
    completions: data.completions.filter(c => c.kidId !== kidId),
    personalRecords: data.personalRecords.filter(r => r.kidId !== kidId),
    activeTimers: data.activeTimers.filter(t => t.kidId !== kidId),
  };
}

export function addRoutine(data: AppData, routine: Routine): AppData {
  return {
    ...data,
    routines: [...data.routines, routine],
  };
}

export function updateRoutine(data: AppData, routineId: string, updates: Partial<Routine>): AppData {
  return {
    ...data,
    routines: data.routines.map(r => r.id === routineId ? { ...r, ...updates } : r),
  };
}

export function deleteRoutine(data: AppData, routineId: string): AppData {
  return {
    ...data,
    routines: data.routines.filter(r => r.id !== routineId),
    tasks: data.tasks.filter(t => t.routineId !== routineId),
    completions: data.completions.filter(c => {
      const task = data.tasks.find(t => t.id === c.taskId);
      return task && task.routineId !== routineId;
    }),
    personalRecords: data.personalRecords.filter(r => {
      const task = data.tasks.find(t => t.id === r.taskId);
      return task && task.routineId !== routineId;
    }),
    worldRecords: data.worldRecords.filter(r => {
      const task = data.tasks.find(t => t.id === r.taskId);
      return task && task.routineId !== routineId;
    }),
    activeTimers: data.activeTimers.filter(t => {
      const task = data.tasks.find(ta => ta.id === t.taskId);
      return task && task.routineId !== routineId;
    }),
  };
}

export function addTask(data: AppData, task: Task): AppData {
  return {
    ...data,
    tasks: [...data.tasks, task],
  };
}

export function updateTask(data: AppData, taskId: string, updates: Partial<Task>): AppData {
  return {
    ...data,
    tasks: data.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
  };
}

export function deleteTask(data: AppData, taskId: string): AppData {
  return {
    ...data,
    tasks: data.tasks.filter(t => t.id !== taskId),
    completions: data.completions.filter(c => c.taskId !== taskId),
    personalRecords: data.personalRecords.filter(r => r.taskId !== taskId),
    worldRecords: data.worldRecords.filter(r => r.taskId !== taskId),
    activeTimers: data.activeTimers.filter(t => t.taskId !== taskId),
  };
}

export function addCompletion(data: AppData, completion: TaskCompletion): AppData {
  const newCompletions = [...data.completions, completion];

  // Update personal record
  const existingPR = data.personalRecords.find(
    r => r.kidId === completion.kidId && r.taskId === completion.taskId
  );

  let newPersonalRecords = [...data.personalRecords];
  if (!existingPR || completion.timeInSeconds < existingPR.personalBest) {
    newPersonalRecords = newPersonalRecords.filter(
      r => !(r.kidId === completion.kidId && r.taskId === completion.taskId)
    );
    newPersonalRecords.push({
      taskId: completion.taskId,
      kidId: completion.kidId,
      personalBest: completion.timeInSeconds,
      lastUpdated: completion.completedAt,
    });
  }

  // Update world record
  const existingWR = data.worldRecords.find(r => r.taskId === completion.taskId);
  let newWorldRecords = [...data.worldRecords];

  if (!existingWR || completion.timeInSeconds < existingWR.time) {
    const kid = data.kids.find(k => k.id === completion.kidId);
    newWorldRecords = newWorldRecords.filter(r => r.taskId !== completion.taskId);
    newWorldRecords.push({
      taskId: completion.taskId,
      kidId: completion.kidId,
      time: completion.timeInSeconds,
      kidName: kid?.name || 'Unknown',
      date: completion.date,
    });
  }

  return {
    ...data,
    completions: newCompletions,
    personalRecords: newPersonalRecords,
    worldRecords: newWorldRecords,
  };
}

export function startTimer(data: AppData, kidId: string, taskId: string): AppData {
  const activeTimers = data.activeTimers.filter(
    t => !(t.kidId === kidId && t.taskId === taskId)
  );

  return {
    ...data,
    activeTimers: [
      ...activeTimers,
      { kidId, taskId, startTime: Date.now() },
    ],
  };
}

export function stopTimer(data: AppData, kidId: string, taskId: string): { data: AppData; elapsedSeconds: number | null } {
  const timer = data.activeTimers.find(
    t => t.kidId === kidId && t.taskId === taskId
  );

  if (!timer) {
    return { data, elapsedSeconds: null };
  }

  const elapsedSeconds = Math.round((Date.now() - timer.startTime) / 1000);

  const newData = {
    ...data,
    activeTimers: data.activeTimers.filter(
      t => !(t.kidId === kidId && t.taskId === taskId)
    ),
  };

  return { data: newData, elapsedSeconds };
}

export function getPersonalBest(data: AppData, kidId: string, taskId: string): number | null {
  const record = data.personalRecords.find(
    r => r.kidId === kidId && r.taskId === taskId
  );
  return record ? record.personalBest : null;
}

export function getPersonalBestWithDate(data: AppData, kidId: string, taskId: string): { time: number; date: string } | null {
  const record = data.personalRecords.find(
    r => r.kidId === kidId && r.taskId === taskId
  );
  return record ? { time: record.personalBest, date: record.lastUpdated } : null;
}

export function getWorldRecord(data: AppData, taskId: string): WorldRecord | null {
  return data.worldRecords.find(r => r.taskId === taskId) || null;
}

export function getTodayCompletions(data: AppData, kidId: string): TaskCompletion[] {
  const today = new Date().toISOString().split('T')[0];
  return data.completions.filter(
    c => c.kidId === kidId && c.date === today
  );
}

export function reorderTasks(data: AppData, routineId: string, taskIds: string[]): AppData {
  const updatedTasks = data.tasks.map(task => {
    if (task.routineId === routineId) {
      const newOrder = taskIds.indexOf(task.id);
      return newOrder >= 0 ? { ...task, order: newOrder + 1 } : task;
    }
    return task;
  });

  return {
    ...data,
    tasks: updatedTasks,
  };
}

