'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getPersonalBest, getWorldRecord } from '@/lib/storage';
import { ArrowLeft, Trophy, Award, Medal } from 'lucide-react';
import Link from 'next/link';

export default function RecordsPage() {
  const { data, isLoading } = useLocalStorage();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const getTasksByRoutine = (routineId: string) => {
    return data.tasks
      .filter((t: { routineId: string }) => t.routineId === routineId)
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      <div className="mx-auto max-w-7xl">
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
              Records & Achievements
            </h1>
          </div>
        </div>

        <div className="space-y-8">
          {/* World Records */}
          <div className="rounded-3xl bg-gradient-to-br from-yellow-300 to-orange-400 p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <Trophy className="h-12 w-12 text-white" />
              <h2 className="text-4xl font-black text-white drop-shadow-lg">World Records</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.routines.map((routine: { id: string; name: string; icon: string }) => {
                const routineTasks = getTasksByRoutine(routine.id);
                if (routineTasks.length === 0) return null;

                return (
                  <div key={routine.id} className="rounded-2xl bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-3xl">{routine.icon}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{routine.name}</h3>
                    </div>
                    <div className="space-y-3">
                      {routineTasks.map((task: { id: string; name: string; icon: string }) => {
                        const wr = getWorldRecord(data, task.id);
                        return (
                          <div key={task.id} className="flex items-center justify-between rounded-xl bg-yellow-50 p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{task.icon}</span>
                              <span className="text-sm font-semibold text-gray-900">{task.name}</span>
                            </div>
                            {wr ? (
                              <div className="text-right">
                                <div className="text-lg font-bold text-yellow-900">{formatTime(wr.time)}</div>
                                <div className="text-xs text-yellow-700">{wr.kidName}</div>
                                <div className="text-xs text-yellow-600">{formatDate(wr.date)}</div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">No record</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Bests by Kid */}
          {data.kids.map((kid: { id: string; name: string; avatar: string }) => {
            const hasAnyRecords = data.personalRecords.some((r: { kidId: string }) => r.kidId === kid.id);

            if (!hasAnyRecords) return null;

            return (
              <div key={kid.id} className="rounded-3xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-6xl">{kid.avatar}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{kid.name}&apos;s Personal Bests</h2>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Medal className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        {data.personalRecords.filter((r: { kidId: string }) => r.kidId === kid.id).length} records
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.routines.map((routine: { id: string; name: string; icon: string; color: string }) => {
                    const routineTasks = getTasksByRoutine(routine.id);
                    const kidRecordsInRoutine = routineTasks.filter(task => {
                      return data.personalRecords.some((r: { kidId: string; taskId: string }) =>
                        r.kidId === kid.id && r.taskId === task.id
                      );
                    });

                    if (kidRecordsInRoutine.length === 0) return null;

                    return (
                      <div key={routine.id}>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-2xl">{routine.icon}</span>
                          <h3 className="text-xl font-bold text-gray-700">{routine.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {routineTasks.map((task: { id: string; name: string; icon: string }) => {
                            const pbRecord = data.personalRecords.find(
                              (r: { kidId: string; taskId: string }) => r.kidId === kid.id && r.taskId === task.id
                            );
                            const wr = getWorldRecord(data, task.id);
                            const isWorldRecord = wr && wr.kidId === kid.id;

                            if (!pbRecord) return null;

                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between rounded-xl p-3 ${
                                  isWorldRecord ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{task.icon}</span>
                                  <span className="text-sm font-semibold text-gray-900">{task.name}</span>
                                  {isWorldRecord && <span className="text-lg">🥇</span>}
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-900">{formatTime(pbRecord.personalBest)}</div>
                                  <div className="text-xs text-blue-700">{formatDate(pbRecord.lastUpdated)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Stats */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <Award className="h-10 w-10 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Overall Stats</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {data.kids.map((kid: { id: string; name: string; avatar: string }) => {
                const totalRecords = data.personalRecords.filter((r: { kidId: string }) => r.kidId === kid.id).length;
                const worldRecords = data.worldRecords.filter((r: { kidId: string }) => r.kidId === kid.id).length;
                const totalCompletions = data.completions.filter((c: { kidId: string }) => c.kidId === kid.id).length;

                return (
                  <div key={kid.id} className="rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-6 text-center">
                    <div className="mb-3 text-5xl">{kid.avatar}</div>
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">{kid.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2">
                        <span className="font-semibold text-gray-700">Personal Bests</span>
                        <span className="text-xl font-bold text-blue-600">{totalRecords}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2">
                        <span className="font-semibold text-gray-700">World Records</span>
                        <span className="text-xl font-bold text-yellow-600">{worldRecords}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2">
                        <span className="font-semibold text-gray-700">Tasks Completed</span>
                        <span className="text-xl font-bold text-green-600">{totalCompletions}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

