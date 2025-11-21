'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import Link from 'next/link';
import { Sun, Moon, Settings, Trophy } from 'lucide-react';

export default function Home() {
  const { data, isLoading } = useLocalStorage();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="text-4xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  const kids = data.kids;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-6xl font-black text-white drop-shadow-lg">
            Daily Routine
          </h1>
          <div className="flex gap-4">
            <Link
              href="/records"
              className="flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-4 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Trophy className="h-8 w-8" />
              Records
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-4 text-2xl font-bold text-gray-800 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Settings className="h-8 w-8" />
              Settings
            </Link>
          </div>
        </div>

        {/* Routine Type Selection */}
        <div className="mb-12">
          <h2 className="mb-6 text-4xl font-black text-white drop-shadow-lg">
            Choose a Routine:
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.routines.map((routine) => (
              <Link
                key={routine.id}
                href={`/multiplayer/${routine.id}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${routine.color} p-12 shadow-2xl transition-all hover:scale-105 active:scale-95`}
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="text-7xl drop-shadow-lg">{routine.icon}</span>
                  <h2 className="text-4xl font-black text-white drop-shadow-lg text-center">
                    {routine.name}
                  </h2>
                  <p className="text-xl text-white/90">Everyone Together!</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Individual Kids Section */}
        <div className="mb-8">
          <h2 className="mb-6 text-4xl font-black text-white drop-shadow-lg">
            Or choose individual:
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kids.map((kid: { id: string; name: string; color: string; avatar: string }) => (
              <div key={kid.id} className="space-y-4">
                <div className="rounded-3xl bg-white p-6 text-center shadow-xl">
                  <div className="mb-4 text-7xl">{kid.avatar}</div>
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">{kid.name}</h3>

                  <div className="flex flex-col gap-3">
                    {data.routines.map((routine) => (
                      <Link
                        key={routine.id}
                        href={`/routine/${kid.id}/${routine.id}`}
                        className={`flex items-center justify-center gap-2 rounded-full bg-gradient-to-r ${routine.color} px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95`}
                      >
                        <span className="text-xl">{routine.icon}</span>
                        {routine.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
