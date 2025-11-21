'use client';

import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      setIsLocked(true);

      // Handle wake lock release
      lock.addEventListener('release', () => {
        setIsLocked(false);
      });

      console.log('Screen Wake Lock acquired');
    } catch (err) {
      console.error('Failed to acquire wake lock:', err);
      setIsLocked(false);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsLocked(false);
        console.log('Screen Wake Lock released');
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    }
  }, [wakeLock]);

  const toggleWakeLock = useCallback(async () => {
    if (isLocked) {
      await releaseWakeLock();
    } else {
      await requestWakeLock();
    }
  }, [isLocked, releaseWakeLock, requestWakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLocked && !wakeLock) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isLocked, wakeLock, requestWakeLock]);

  return {
    isSupported,
    isLocked,
    toggleWakeLock,
  };
}




