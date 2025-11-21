export type RoutineType = 'morning' | 'evening' | string;

export interface Routine {
  id: string;
  name: string;
  icon: string;
  color: string; // gradient or solid color for the routine card
  isDefault: boolean; // true for morning/evening, false for custom
}

export interface Kid {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  routineId: string; // Changed from routineType to routineId
  order: number;
}

export interface TaskCompletion {
  kidId: string;
  taskId: string;
  date: string; // ISO date string
  timeInSeconds: number;
  completedAt: string; // ISO timestamp
}

export interface TaskRecord {
  taskId: string;
  kidId: string;
  personalBest: number; // seconds
  lastUpdated: string; // ISO timestamp
}

export interface WorldRecord {
  taskId: string;
  kidId: string;
  time: number; // seconds
  kidName: string;
  date: string; // ISO date string
}

export interface ActiveTimer {
  kidId: string;
  taskId: string;
  startTime: number; // timestamp
}

export interface AppData {
  version: number; // Data structure version
  kids: Kid[];
  routines: Routine[];
  tasks: Task[];
  completions: TaskCompletion[];
  personalRecords: TaskRecord[];
  worldRecords: WorldRecord[];
  activeTimers: ActiveTimer[];
}

