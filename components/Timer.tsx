'use client';

import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';

interface TimerProps {
  isActive: boolean;
  startTime?: number;
  onStart: () => void;
  onStop: (seconds: number) => void;
  isCompleted: boolean;
}

export function Timer({ isActive, startTime, onStart, onStop, isCompleted }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isActive && startTime) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);

      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [isActive, startTime]);

  const handleStop = () => {
    if (isActive && elapsed > 0) {
      onStop(elapsed);
    }
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex items-center gap-3">
      {!isCompleted && (
        <>
          {!isActive ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-white font-bold text-lg transition-transform active:scale-95 hover:bg-green-600"
            >
              <Play className="h-6 w-6" fill="white" />
              Start Timer
            </button>
          ) : (
            <>
              <div className="text-4xl font-mono font-bold text-gray-900 tabular-nums">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <button
                onClick={handleStop}
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-white font-bold text-lg transition-transform active:scale-95 hover:bg-red-600"
              >
                <Square className="h-6 w-6" fill="white" />
                Stop
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

