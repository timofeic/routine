'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  show: boolean;
  message?: string;
  totalTime?: number;
  isNewPersonalBest?: boolean;
  isNewWorldRecord?: boolean;
}

export function Celebration({
  show,
  message = 'Great Job!',
  totalTime,
  isNewPersonalBest,
  isNewWorldRecord,
}: CelebrationProps) {
  useEffect(() => {
    if (show) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });
      }, 40);

      return () => clearInterval(interval);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-w-2xl rounded-3xl bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 p-8 text-center shadow-2xl animate-bounce-in">
        <div className="space-y-6">
          <div className="text-8xl animate-pulse">🎉</div>

          <h1 className="text-6xl font-black text-white drop-shadow-lg">
            {message}
          </h1>

          {totalTime !== undefined && (
            <div className="text-4xl font-bold text-white">
              Total Time: {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
            </div>
          )}

          {isNewWorldRecord && (
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-200 animate-pulse">
              <span className="text-5xl">🥇</span>
              NEW WORLD RECORD!
            </div>
          )}

          {isNewPersonalBest && !isNewWorldRecord && (
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-200 animate-pulse">
              <span className="text-5xl">🎖️</span>
              NEW PERSONAL BEST!
            </div>
          )}

          <div className="flex justify-center gap-4 text-6xl">
            <span className="animate-bounce delay-100">⭐</span>
            <span className="animate-bounce delay-200">✨</span>
            <span className="animate-bounce delay-300">🌟</span>
          </div>
        </div>
      </div>
    </div>
  );
}

