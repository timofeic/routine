export type RoutineType = 'morning' | 'evening';

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
  routineType: RoutineType;
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
  kids: Kid[];
  tasks: Task[];
  completions: TaskCompletion[];
  personalRecords: TaskRecord[];
  worldRecords: WorldRecord[];
  activeTimers: ActiveTimer[];
}

