'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// NoSleep video sources - these are proven to work on iOS
// Using webm with opus codec for iOS 17+ and mp4 for older iOS
const NOSLEEP_VIDEO_WEBM = 'data:video/webm;base64,GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1NAwAAAAAAAAAHCUQbgAAAAAAAFUmpZqkq17GDD0JATYCNTGF2ZjU4Ljc2LjEwMFdBjUxhdmY1OC43Ni4xMDBEiYhARAAAAAAAABZUrmsBAAAAAAAAR6uBBMBTaQq0+BIAALgAvmNkJYxaAD9pVxaADQAAAAAAnpG3E0JAgUIBcQAAAAAAABRTYWQBAAAAAAAAESvg7+Dgw3gGP/+H/2X/+f/F';

const NOSLEEP_VIDEO_MP4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrwYF//+r3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyA1YzY1NzA0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU4Ljc2LjEwMA==';

class NoSleep {
  private enabled = false;
  private video: HTMLVideoElement | null = null;

  enable(): Promise<void> {
    if (this.enabled) return Promise.resolve();

    if (!this.video) {
      this.video = document.createElement('video');
      this.video.setAttribute('title', 'No Sleep');
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');
      this.video.setAttribute('muted', '');
      this.video.muted = true;
      this.video.loop = true;
      
      // Try webm first (better for newer iOS), fallback to mp4
      const canPlayWebm = this.video.canPlayType('video/webm; codecs="vp9,opus"');
      if (canPlayWebm === 'probably' || canPlayWebm === 'maybe') {
        this.video.src = NOSLEEP_VIDEO_WEBM;
      } else {
        this.video.src = NOSLEEP_VIDEO_MP4;
      }

      // Hide the video
      this.video.style.position = 'absolute';
      this.video.style.left = '-100%';
      this.video.style.top = '-100%';
      
      document.body.appendChild(this.video);
    }

    return this.video.play()
      .then(() => {
        this.enabled = true;
        console.log('NoSleep enabled');
      })
      .catch((err) => {
        console.error('NoSleep enable failed:', err);
        throw err;
      });
  }

  disable(): void {
    if (this.video) {
      this.video.pause();
    }
    this.enabled = false;
    console.log('NoSleep disabled');
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  destroy(): void {
    this.disable();
    if (this.video) {
      this.video.remove();
      this.video = null;
    }
  }
}

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [useVideoFallback, setUseVideoFallback] = useState(false);
  const noSleepRef = useRef<NoSleep | null>(null);

  useEffect(() => {
    // Check if native Wake Lock API is supported
    const hasNativeWakeLock = 'wakeLock' in navigator;

    // For iOS/Safari, we'll use the video fallback
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (hasNativeWakeLock && !isSafari) {
      setIsSupported(true);
      setUseVideoFallback(false);
    } else if (isIOS || isSafari) {
      // Use video fallback for iOS and Safari
      setIsSupported(true);
      setUseVideoFallback(true);
      noSleepRef.current = new NoSleep();
    } else {
      setIsSupported(false);
    }

    return () => {
      // Cleanup on unmount
      if (noSleepRef.current) {
        noSleepRef.current.destroy();
        noSleepRef.current = null;
      }
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    if (useVideoFallback) {
      // iOS/Safari fallback: use NoSleep video
      try {
        if (!noSleepRef.current) {
          noSleepRef.current = new NoSleep();
        }
        await noSleepRef.current.enable();
        setIsLocked(true);
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
      // iOS/Safari fallback: disable NoSleep
      if (noSleepRef.current) {
        noSleepRef.current.disable();
        setIsLocked(false);
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
        if (useVideoFallback && noSleepRef.current) {
          noSleepRef.current.enable().catch(console.error);
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
