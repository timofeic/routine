'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TaskCard } from '@/components/TaskCard';
import { Celebration } from '@/components/Celebration';
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
  params: Promise<{ kidId: string; type: RoutineType }>;
}

export default function RoutinePage({ params }: PageProps) {
  const { kidId, type } = use(params);
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

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const kid = data.kids.find((k: Kid) => k.id === kidId);
  const tasks = data.tasks
    .filter((t: Task) => t.routineType === type)
    .sort((a: Task, b: Task) => a.order - b.order);

  if (!kid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Kid not found</div>
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

          setCompletedTaskIds(new Set([...completedTaskIds, taskId]));
        } else {
          updateData(newData);
        }
      } else {
        // Complete without timer
        setCompletedTaskIds(new Set([...completedTaskIds, taskId]));
      }
    } else {
      // Uncomplete
      const newCompleted = new Set(completedTaskIds);
      newCompleted.delete(taskId);
      setCompletedTaskIds(newCompleted);
    }

    // Check if all tasks are now completed
    const allCompleted = tasks.every(
      (t: { id: string }) => completedTaskIds.has(t.id) || (t.id === taskId && !isCurrentlyCompleted)
    );

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
        <div className="mb-8 flex items-center justify-between">
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
                  {kid.name}&apos;s {type === 'morning' ? 'Morning' : 'Evening'} Routine
                </h1>
              </div>
            </div>
          </div>

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

