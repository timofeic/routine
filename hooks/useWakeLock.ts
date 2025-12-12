'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// For iOS Safari, we use a video loop workaround since Wake Lock API isn't supported
function createNoSleepVideo(): HTMLVideoElement {
  const video = document.createElement('video');
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.muted = true;
  video.loop = true;
  
  // Minimal base64 encoded mp4 video (1x1 pixel, silent)
  // This is the smallest valid mp4 that iOS will play
  video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAJaUdmY3ByIAAAAgAAAABgAAADAMAgPyA9gAAAAwBAAAADAMBRvAAAAwAAAAMAgPyA9gAAAAwAAAAMAwFG8AAAAwAAAAMAgTyA9gAAAAwAAAAMBRvAAAAwBAAAAMAgfyA9gAAAAwAAAAMBRvAAAAwAAAAMAgfyA9gAAAAwAAAAMBRvAAAAwBAAAAMAgfyA9gAAAAwAAAAMBRvAAAAwAAAAMAgfyA9gAAAAwAAAAMBRvAAAAwDAAAAMAgfyA9gAAAAwAAAAMBR';
  
  video.style.position = 'absolute';
  video.style.left = '-9999px';
  video.style.top = '-9999px';
  video.style.width = '1px';
  video.style.height = '1px';
  
  document.body.appendChild(video);
  return video;
}

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [useVideoFallback, setUseVideoFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Check if native Wake Lock API is supported
    const hasNativeWakeLock = 'wakeLock' in navigator;
    
    // For iOS/Safari, we'll use the video fallback
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (hasNativeWakeLock) {
      setIsSupported(true);
      setUseVideoFallback(false);
    } else if (isIOS) {
      // Use video fallback for iOS
      setIsSupported(true);
      setUseVideoFallback(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      // Cleanup video element on unmount
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    if (useVideoFallback) {
      // iOS fallback: use video loop
      try {
        if (!videoRef.current) {
          videoRef.current = createNoSleepVideo();
        }
        await videoRef.current.play();
        setIsLocked(true);
        console.log('Screen Wake Lock acquired (video fallback)');
      } catch (err) {
        console.error('Failed to acquire wake lock (video fallback):', err);
        setIsLocked(false);
      }
    } else {
      // Native Wake Lock API
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        setIsLocked(true);

        lock.addEventListener('release', () => {
          setIsLocked(false);
        });

        console.log('Screen Wake Lock acquired');
      } catch (err) {
        console.error('Failed to acquire wake lock:', err);
        setIsLocked(false);
      }
    }
  }, [isSupported, useVideoFallback]);

  const releaseWakeLock = useCallback(async () => {
    if (useVideoFallback) {
      // iOS fallback: pause video
      if (videoRef.current) {
        videoRef.current.pause();
        setIsLocked(false);
        console.log('Screen Wake Lock released (video fallback)');
      }
    } else if (wakeLock) {
      // Native Wake Lock API
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsLocked(false);
        console.log('Screen Wake Lock released');
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    }
  }, [wakeLock, useVideoFallback]);

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
      if (document.visibilityState === 'visible' && isLocked) {
        if (useVideoFallback) {
          videoRef.current?.play();
        } else if (!wakeLock) {
          requestWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isLocked, wakeLock, requestWakeLock, useVideoFallback]);

  return {
    isSupported,
    isLocked,
    toggleWakeLock,
  };
}




