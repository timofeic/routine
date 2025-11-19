import type { AppData, Kid, Task, TaskCompletion, TaskRecord, WorldRecord, ActiveTimer } from './types';

export type { AppData };

const STORAGE_KEY = 'kids-routine-app-data';

const DEFAULT_KIDS: Kid[] = [
  { id: '1', name: 'Child 1', color: 'bg-blue-500', avatar: '👦' },
  { id: '2', name: 'Child 2', color: 'bg-pink-500', avatar: '👧' },
];

const DEFAULT_TASKS: Task[] = [
  // Morning tasks
  { id: 'm1', name: 'Go to the toilet', icon: '🚽', routineType: 'morning', order: 1 },
  { id: 'm2', name: 'Get changed', icon: '👕', routineType: 'morning', order: 2 },
  { id: 'm3', name: 'Pack bag for school', icon: '🎒', routineType: 'morning', order: 3 },
  { id: 'm4', name: 'Eat breakfast', icon: '🍳', routineType: 'morning', order: 4 },
  { id: 'm5', name: 'Brush teeth', icon: '🪥', routineType: 'morning', order: 5 },
  { id: 'm6', name: 'Say bye to Mum', icon: '👋', routineType: 'morning', order: 6 },
  // Evening tasks
  { id: 'e1', name: 'Clean up the table', icon: '🧹', routineType: 'evening', order: 1 },
  { id: 'e2', name: 'Tidy toys', icon: '🧸', routineType: 'evening', order: 2 },
  { id: 'e3', name: 'Take a bath', icon: '🛁', routineType: 'evening', order: 3 },
  { id: 'e4', name: 'Brush teeth', icon: '🪥', routineType: 'evening', order: 4 },
  { id: 'e5', name: 'Get changed', icon: '🌙', routineType: 'evening', order: 5 },
  { id: 'e6', name: 'Read bedtime story', icon: '📖', routineType: 'evening', order: 6 },
];

function getDefaultData(): AppData {
  return {
    kids: DEFAULT_KIDS,
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
    return JSON.parse(stored);
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

export function reorderTasks(data: AppData, routineType: 'morning' | 'evening', taskIds: string[]): AppData {
  const updatedTasks = data.tasks.map(task => {
    if (task.routineType === routineType) {
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

