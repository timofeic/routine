'use client';

import { use, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Celebration } from '@/components/Celebration';
import { MultiplayerTaskItem } from '@/components/MultiplayerTaskItem';
import { WakeLockToggle } from '@/components/WakeLockToggle';
import {
  addCompletion,
  startTimer,
  stopTimer,
  getPersonalBestWithDate,
  getWorldRecord,
  getTodayCompletions,
} from '@/lib/storage';
import { RoutineType, Kid, Task } from '@/lib/types';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ type: string }>;
}

interface KidProgress {
  kidId: string;
  completedTaskIds: Set<string>;
  currentTaskIndex: number;
}

export default function MultiplayerPage({ params }: PageProps) {
  const { type: routineId } = use(params);
  const { data, updateData, isLoading } = useLocalStorage();
  const [kidProgress, setKidProgress] = useState<Map<string, KidProgress>>(new Map());
  const [showCelebration, setShowCelebration] = useState(false);
  const [winner, setWinner] = useState<Kid | null>(null);
  const [allFinished, setAllFinished] = useState(false);

  useEffect(() => {
    if (data) {
      const progressMap = new Map<string, KidProgress>();

      data.kids.forEach((kid: Kid) => {
        const todayCompletions = getTodayCompletions(data, kid.id);
        const completed = new Set(todayCompletions.map((c) => c.taskId));
        const tasks = data.tasks.filter((t: Task) => t.routineId === routineId).sort((a: Task, b: Task) => a.order - b.order);
        const currentIndex = tasks.findIndex((t: Task) => !completed.has(t.id));

        progressMap.set(kid.id, {
          kidId: kid.id,
          completedTaskIds: completed,
          currentTaskIndex: currentIndex === -1 ? tasks.length : currentIndex,
        });
      });

      setKidProgress(progressMap);
    }
  }, [data, routineId]);

  // Check for winner and celebrations when progress changes
  useEffect(() => {
    if (!data || kidProgress.size === 0) return;

    const tasks = data.tasks
      .filter((t: Task) => t.routineId === routineId)
      .sort((a: Task, b: Task) => a.order - b.order);

    // Check if any kid just finished first
    const completedKids = Array.from(kidProgress.values())
      .filter((p) => p.completedTaskIds.size === tasks.length);

    if (completedKids.length === 1 && !winner) {
      const kid = data.kids.find((k: Kid) => k.id === completedKids[0].kidId);
      setWinner(kid || null);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }

    // Check if everyone is finished
    const everyoneFinished = Array.from(kidProgress.values()).every(
      (p) => p.completedTaskIds.size === tasks.length
    );
    if (everyoneFinished && kidProgress.size > 0 && !allFinished) {
      setAllFinished(true);
      setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
        }, 4000);
      }, 3500);
    }
  }, [kidProgress, data, routineId, winner, allFinished]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const kids = data.kids;
  const routine = data.routines.find((r) => r.id === routineId);
  const tasks = data.tasks
    .filter((t: Task) => t.routineId === routineId)
    .sort((a: Task, b: Task) => a.order - b.order);

  if (!routine) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-2xl text-white">Routine not found</div>
      </div>
    );
  }

  const handleToggleTask = async (kidId: string, taskId: string) => {
    const progress = kidProgress.get(kidId);
    if (!progress) return;

    const isCurrentlyCompleted = progress.completedTaskIds.has(taskId);

    if (!isCurrentlyCompleted) {
      // Check if timer is running
      const activeTimer = data.activeTimers.find(
        (t: { kidId: string; taskId: string; startTime: number }) => t.kidId === kidId && t.taskId === taskId
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
      // Note: Don't manually update kidProgress here - let useEffect handle it from storage
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
      // Note: Don't manually update kidProgress here - let useEffect handle it from storage
    }
  };

  const handleStartTimer = (kidId: string, taskId: string) => {
    const newData = startTimer(data, kidId, taskId);
    updateData(newData);
  };

  const handleStopTimer = (kidId: string, taskId: string) => {
    const activeTimer = data.activeTimers.find(
      (t: { kidId: string; taskId: string; startTime: number }) => t.kidId === kidId && t.taskId === taskId
    );

    if (activeTimer) {
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
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all tasks for everyone? This will clear all progress for today.')) {
      // Clear local state
      const progressMap = new Map<string, KidProgress>();
      data.kids.forEach((kid: Kid) => {
        progressMap.set(kid.id, {
          kidId: kid.id,
          completedTaskIds: new Set(),
          currentTaskIndex: 0,
        });
      });
      setKidProgress(progressMap);
      setWinner(null);
      setAllFinished(false);

      // Clear today's completions from storage
      const today = new Date().toISOString().split('T')[0];
      const taskIds = tasks.map((t) => t.id);
      const updatedData = {
        ...data,
        completions: data.completions.filter(
          (c) => !(c.date === today && taskIds.includes(c.taskId))
        ),
        activeTimers: [],
      };
      updateData(updatedData);
    }
  };

  const hasAnyProgress = Array.from(kidProgress.values()).some((p) => p.completedTaskIds.size > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-white p-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-8 w-8 text-gray-800" />
            </Link>
            <h1 className="text-5xl font-black text-white drop-shadow-lg">
              {routine.name} Routine - Race Mode!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <WakeLockToggle />
            {hasAnyProgress && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-bold text-red-600 shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-red-50"
              >
                <RotateCcw className="h-6 w-6" />
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Kid Lanes */}
        <div className={`grid gap-6 ${kids.length <= 2 ? 'grid-cols-2' : kids.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {kids.map((kid: Kid) => {
            const progress = kidProgress.get(kid.id);
            const completedCount = progress?.completedTaskIds.size || 0;
            const progressPercent = (completedCount / tasks.length) * 100;
            const isLeading = progress && progress.currentTaskIndex > 0 &&
              Array.from(kidProgress.values()).every(
                (p) => p.kidId === kid.id || p.currentTaskIndex <= progress.currentTaskIndex
              );

            return (
              <div
                key={kid.id}
                className={`rounded-3xl bg-white p-6 shadow-xl transition-all ${
                  isLeading && completedCount < tasks.length ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {/* Kid Header */}
                <div className="mb-4 text-center">
                  <div className="mb-2 text-6xl">{kid.avatar}</div>
                  <h2 className="text-3xl font-bold text-gray-900">{kid.name}</h2>
                  {isLeading && completedCount < tasks.length && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-yellow-600">
                      <Trophy className="h-6 w-6" />
                      <span className="text-xl font-bold">Leading!</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-4 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mb-4 text-center text-xl font-bold text-gray-700">
                  {completedCount} / {tasks.length}
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {tasks.map((task: Task) => {
                    const isCompleted = progress?.completedTaskIds.has(task.id) || false;
                    const activeTimer = data.activeTimers.find(
                      (t: { kidId: string; taskId: string; startTime: number }) => t.kidId === kid.id && t.taskId === task.id
                    );
                    const pb = getPersonalBestWithDate(data, kid.id, task.id);
                    const wr = getWorldRecord(data, task.id);

                    return (
                      <MultiplayerTaskItem
                        key={task.id}
                        task={task}
                        kidId={kid.id}
                        isCompleted={isCompleted}
                        activeTimer={activeTimer}
                        personalBest={pb}
                        worldRecord={wr ? { time: wr.time, date: wr.date } : null}
                        onToggle={() => handleToggleTask(kid.id, task.id)}
                        onStartTimer={() => handleStartTimer(kid.id, task.id)}
                        onStopTimer={() => handleStopTimer(kid.id, task.id)}
                      />
                    );
                  })}
                </div>

                {completedCount === tasks.length && (
                  <div className="mt-4 text-center">
                    <div className="text-4xl animate-bounce">🎉</div>
                    <div className="text-xl font-bold text-green-600">Finished!</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebration */}
      <Celebration
        show={showCelebration}
        message={
          allFinished
            ? 'Everyone Finished! Great Teamwork!'
            : winner
            ? `${winner.name} Finished First! ${winner.avatar}`
            : 'Amazing!'
        }
      />
    </div>
  );
}

