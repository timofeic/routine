'use client';

import { useWakeLock } from '@/hooks/useWakeLock';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function WakeLockToggle() {
  const { isSupported, isLocked, toggleWakeLock, error } = useWakeLock();

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleWakeLock}
      className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-lg transition-all ${
        error
          ? 'bg-red-500 text-white hover:bg-red-600'
          : isLocked
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
      title={error || (isLocked ? 'Screen will stay on' : 'Screen can turn off')}
    >
      {error ? (
        <>
          <AlertCircle className="h-5 w-5" />
          <span>Not Supported</span>
        </>
      ) : isLocked ? (
        <>
          <Eye className="h-5 w-5" />
          <span>Screen On</span>
        </>
      ) : (
        <>
          <EyeOff className="h-5 w-5" />
          <span>Keep Awake</span>
        </>
      )}
    </button>
  );
}




