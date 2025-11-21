'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskCard } from '@/components/TaskCard';
import { Celebration } from '@/components/Celebration';
import { WakeLockToggle } from '@/components/WakeLockToggle';
import {
  addCompletion,
  startTimer,
  stopTimer,
  getPersonalBest,
  getPersonalBestWithDate,
  getWorldRecord,
  getTodayCompletions,
} from '@/lib/storage';
import { RoutineType, Task, ActiveTimer, WorldRecord, Kid } from '@/lib/types';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ kidId: string; type: string }>;
}

export default function RoutinePage({ params }: PageProps) {
  const { kidId, type: routineId } = use(params);
  const { data, updateData, isLoading } = useLocalStorage();
  const router = useRouter();
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    isNewPB: boolean;
    isNewWR: boolean;
    totalTime: number;
  } | null>(null);

  useEffect(() => {
    if (data) {
      const todayCompletions = getTodayCompletions(data, kidId);
      const completed = new Set(todayCompletions.map((c) => c.taskId));
      setCompletedTaskIds(completed);
    }
  }, [data, kidId]);

  // Check for completion celebration when tasks change
  useEffect(() => {
    if (!data || completedTaskIds.size === 0) return;

    const tasks = data.tasks
      .filter((t: Task) => t.routineId === routineId)
      .sort((a: Task, b: Task) => a.order - b.order);

    // Check if all tasks are completed
    const allCompleted = tasks.length > 0 && tasks.every((t: { id: string }) => completedTaskIds.has(t.id));

    if (allCompleted) {
      // Calculate total time
      const todayCompletions = getTodayCompletions(data, kidId).filter((c: { taskId: string }) =>
        tasks.some((t: { id: string }) => t.id === c.taskId)
      );
      const totalTime = todayCompletions.reduce((sum: number, c: { timeInSeconds: number }) => sum + c.timeInSeconds, 0);

      setCelebrationData({
        isNewPB: false,
        isNewWR: false,
        totalTime,
      });
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    }
  }, [completedTaskIds, data, kidId, routineId]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const kid = data.kids.find((k: Kid) => k.id === kidId);
  const routine = data.routines.find((r) => r.id === routineId);
  const tasks = data.tasks
    .filter((t: Task) => t.routineId === routineId)
    .sort((a: Task, b: Task) => a.order - b.order);

  if (!kid || !routine) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-2xl text-white">{!kid ? 'Kid not found' : 'Routine not found'}</div>
      </div>
    );
  }

  const handleToggleTask = async (taskId: string) => {
    const isCurrentlyCompleted = completedTaskIds.has(taskId);

    if (!isCurrentlyCompleted) {
      // Check if timer is running
      const activeTimer = data.activeTimers.find(
        (t: ActiveTimer) => t.kidId === kidId && t.taskId === taskId
      );

      if (activeTimer) {
        // Stop timer and record completion
        const { data: newData, elapsedSeconds } = stopTimer(data, kidId, taskId);

        if (elapsedSeconds) {
          const completion = {
            kidId,
            taskId,
            date: new Date().toISOString().split('T')[0],
            timeInSeconds: elapsedSeconds,
            completedAt: new Date().toISOString(),
          };

          const updatedData = addCompletion(newData, completion);
          updateData(updatedData);
        } else {
          updateData(newData);
        }
      } else {
        // No timer running - save completion with 0 seconds
        const completion = {
          kidId,
          taskId,
          date: new Date().toISOString().split('T')[0],
          timeInSeconds: 0,
          completedAt: new Date().toISOString(),
        };

        const updatedData = addCompletion(data, completion);
        updateData(updatedData);
      }
      // Note: Don't manually update completedTaskIds here - let useEffect handle it from storage
    } else {
      // Uncomplete - remove completion from storage
      const today = new Date().toISOString().split('T')[0];
      const updatedData = {
        ...data,
        completions: data.completions.filter(
          (c) => !(c.kidId === kidId && c.taskId === taskId && c.date === today)
        ),
      };
      updateData(updatedData);
      // Note: Don't manually update completedTaskIds here - let useEffect handle it from storage
    }
  };

  const handleStartTimer = (taskId: string) => {
    const newData = startTimer(data, kidId, taskId);
    updateData(newData);
  };

  const handleStopTimer = (taskId: string, seconds: number) => {
    const { data: newData } = stopTimer(data, kidId, taskId);

    const completion = {
      kidId,
      taskId,
      date: new Date().toISOString().split('T')[0],
      timeInSeconds: seconds,
      completedAt: new Date().toISOString(),
    };

    const oldPB = getPersonalBest(data, kidId, taskId);
    const oldWR = getWorldRecord(data, taskId);

    const updatedData = addCompletion(newData, completion);
    updateData(updatedData);

    const newPB = getPersonalBest(updatedData, kidId, taskId);
    const newWR = getWorldRecord(updatedData, taskId);

    const isNewPB = !oldPB || (newPB !== null && newPB < oldPB);
    const isNewWR = !oldWR || (newWR !== null && newWR.time < (oldWR.time || Infinity));

    if (isNewPB || isNewWR) {
      setCelebrationData({
        isNewPB: !!isNewPB,
        isNewWR: !!isNewWR,
        totalTime: seconds,
      });
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all tasks? This will clear your progress for today.')) {
      // Clear local state
      setCompletedTaskIds(new Set());

      // Clear today's completions from storage
      const today = new Date().toISOString().split('T')[0];
      const taskIds = tasks.map((t) => t.id);
      const updatedData = {
        ...data,
        completions: data.completions.filter(
          (c) => !(c.kidId === kidId && c.date === today && taskIds.includes(c.taskId))
        ),
        activeTimers: data.activeTimers.filter((t) => t.kidId !== kidId),
      };
      updateData(updatedData);
    }
  };

  const progress = (completedTaskIds.size / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="rounded-full bg-white p-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="h-8 w-8 text-gray-800" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-6xl">{kid.avatar}</span>
                  <h1 className="text-5xl font-black text-white drop-shadow-lg">
                    {kid.name}&apos;s {routine.name} Routine
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <WakeLockToggle />
              {completedTaskIds.size > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-bold text-red-600 shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-red-50"
                >
                  <RotateCcw className="h-6 w-6" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-full bg-white/30 p-2 backdrop-blur-sm">
          <div className="relative h-8 overflow-hidden rounded-full bg-gray-300">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {completedTaskIds.size} / {tasks.length} Complete
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-6">
          {tasks.map((task: Task) => {
            const activeTimer = data.activeTimers.find(
              (t: ActiveTimer) => t.kidId === kidId && t.taskId === task.id
            );
            const pb = getPersonalBestWithDate(data, kidId, task.id);
            const wr = getWorldRecord(data, task.id);

            return (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={completedTaskIds.has(task.id)}
                onToggle={() => handleToggleTask(task.id)}
                onTimerStart={() => handleStartTimer(task.id)}
                onTimerStop={(seconds) => handleStopTimer(task.id, seconds)}
                activeTimer={activeTimer}
                personalBest={pb}
                worldRecord={wr ? { time: wr.time, date: wr.date, holder: wr.kidName } : null}
              />
            );
          })}
        </div>
      </div>

      {/* Celebration */}
      <Celebration
        show={showCelebration}
        message={celebrationData?.isNewWR ? 'NEW WORLD RECORD!' : celebrationData?.isNewPB ? 'NEW PERSONAL BEST!' : 'All Done! Amazing Job!'}
        totalTime={celebrationData?.totalTime}
        isNewPersonalBest={celebrationData?.isNewPB}
        isNewWorldRecord={celebrationData?.isNewWR}
      />
    </div>
  );
}

