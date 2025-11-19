'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { CheckCircle2, Circle, Play, Square } from 'lucide-react';

interface MultiplayerTaskItemProps {
  task: Task;
  kidId: string;
  isCompleted: boolean;
  activeTimer: { kidId: string; taskId: string; startTime: number } | undefined;
  personalBest: { time: number; date: string } | null;
  worldRecord: { time: number; date: string } | null;
  onToggle: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

export function MultiplayerTaskItem({
  task,
  kidId,
  isCompleted,
  activeTimer,
  personalBest,
  worldRecord,
  onToggle,
  onStartTimer,
  onStopTimer,
}: MultiplayerTaskItemProps) {
  const isTimerActive = !!activeTimer;
  const [elapsed, setElapsed] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    if (dateOnly === todayOnly) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    if (isTimerActive && activeTimer) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [isTimerActive, activeTimer]);

  return (
    <div
      className={`rounded-2xl border-2 p-3 transition-all ${
        isCompleted
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="flex-shrink-0 transition-transform active:scale-90"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" strokeWidth={3} />
          ) : (
            <Circle className="h-8 w-8 text-gray-400" strokeWidth={3} />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{task.icon}</span>
            <span className="text-sm font-semibold text-gray-900">{task.name}</span>
          </div>

          {!isCompleted && (
            <div className="mt-1 flex items-center gap-2">
              {!isTimerActive ? (
                <button
                  onClick={onStartTimer}
                  className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white transition-transform active:scale-95"
                >
                  <Play className="h-3 w-3" fill="white" />
                  Start
                </button>
              ) : (
                <>
                  <span className="text-lg font-mono font-bold text-gray-900">
                    {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={onStopTimer}
                    className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white transition-transform active:scale-95"
                  >
                    <Square className="h-3 w-3" fill="white" />
                    Stop
                  </button>
                </>
              )}
            </div>
          )}

          {(personalBest || worldRecord) && (
            <div className="mt-1 flex flex-col gap-1 text-xs">
              {personalBest && (
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-900">
                    🎖️ {Math.floor(personalBest.time / 60)}:{(personalBest.time % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-blue-700">{formatDate(personalBest.date)}</span>
                </div>
              )}
              {worldRecord && (
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-semibold text-yellow-900">
                    🥇 {Math.floor(worldRecord.time / 60)}:{(worldRecord.time % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-yellow-700">{formatDate(worldRecord.date)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

