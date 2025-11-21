'use client';

import { Task, ActiveTimer } from '@/lib/types';
import { Timer } from './Timer';
import { CheckCircle2, Circle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  onTimerStart: () => void;
  onTimerStop: (seconds: number) => void;
  activeTimer: ActiveTimer | undefined;
  personalBest: { time: number; date: string } | null;
  worldRecord: { time: number; date: string; holder: string } | null;
  showTimer?: boolean;
}

export function TaskCard({
  task,
  isCompleted,
  onToggle,
  onTimerStart,
  onTimerStop,
  activeTimer,
  personalBest,
  worldRecord,
  showTimer = true,
}: TaskCardProps) {
  const isTimerActive = !!activeTimer;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === yesterdayOnly) return 'Yesterday';

    // Format as "Dec 25"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`
        relative flex items-center gap-4 rounded-3xl border-4 p-6 transition-all
        ${isCompleted
          ? 'border-green-500 bg-green-50 scale-[0.98]'
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
      `}
    >
      {/* Column 1: Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 transition-transform active:scale-90"
      >
        {isCompleted ? (
          <CheckCircle2 className="h-12 w-12 text-green-600" strokeWidth={3} />
        ) : (
          <Circle className="h-12 w-12 text-gray-400" strokeWidth={3} />
        )}
      </button>

      {/* Column 2: Task Icon */}
      <span className="text-5xl flex-shrink-0">{task.icon}</span>

      {/* Column 3: Task Name */}
      <h3 className="text-2xl font-bold text-gray-900 min-w-0 flex-shrink">{task.name}</h3>

      {/* Column 4: Timer Section */}
      {showTimer && (
        <div className="flex-shrink-0 ml-auto">
          <Timer
            isActive={isTimerActive}
            startTime={activeTimer?.startTime}
            onStart={onTimerStart}
            onStop={onTimerStop}
            isCompleted={isCompleted}
          />
        </div>
      )}

      {/* Column 5: Records Display - Far Right */}
      {(personalBest || worldRecord) && (
        <div className="flex flex-col gap-2 text-sm flex-shrink-0 ml-4">
          {personalBest && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-2 whitespace-nowrap">
              <span className="text-xl">🎖️</span>
              <div className="flex flex-col">
                <span className="font-bold text-blue-900">
                  {Math.floor(personalBest.time / 60)}:{(personalBest.time % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-blue-700">{formatDate(personalBest.date)}</span>
              </div>
            </div>
          )}
          {worldRecord && (
            <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-3 py-2 whitespace-nowrap">
              <span className="text-xl">🥇</span>
              <div className="flex flex-col">
                <span className="font-bold text-yellow-900">
                  {Math.floor(worldRecord.time / 60)}:{(worldRecord.time % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-yellow-700">{formatDate(worldRecord.date)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

