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
        relative flex flex-col gap-4 rounded-3xl border-4 p-6 transition-all
        ${isCompleted
          ? 'border-green-500 bg-green-50 scale-[0.98]'
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
      `}
    >
      {/* Task Icon and Name */}
      <div className="flex items-center gap-4">
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

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{task.icon}</span>
            <h3 className="text-2xl font-bold text-gray-900">{task.name}</h3>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      {showTimer && (
        <div className="ml-16">
          <Timer
            isActive={isTimerActive}
            startTime={activeTimer?.startTime}
            onStart={onTimerStart}
            onStop={onTimerStop}
            isCompleted={isCompleted}
          />
        </div>
      )}

      {/* Records Display */}
      {(personalBest || worldRecord) && (
        <div className="ml-16 flex flex-wrap gap-3 text-sm">
          {personalBest && (
            <div className="flex flex-col rounded-xl bg-blue-100 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎖️</span>
                <span className="font-bold text-blue-900">
                  {Math.floor(personalBest.time / 60)}:{(personalBest.time % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-blue-700">PB • {formatDate(personalBest.date)}</span>
            </div>
          )}
          {worldRecord && (
            <div className="flex flex-col rounded-xl bg-yellow-100 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥇</span>
                <span className="font-bold text-yellow-900">
                  {Math.floor(worldRecord.time / 60)}:{(worldRecord.time % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-yellow-700">
                WR • {worldRecord.holder} • {formatDate(worldRecord.date)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

