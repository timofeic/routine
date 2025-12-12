'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, Compass } from 'lucide-react';

type PromptType = 'native' | 'ios-safari' | 'ios-other' | null;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [promptType, setPromptType] = useState<PromptType>(null);
  const [dismissed, setDismissed] = useState(true); // Start as true to prevent flash

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('installPromptDismissed')) {
      return;
    }

    // Check if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detect iOS/iPadOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Detect Safari on iOS
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);

    if (isIOS) {
      // On iOS, only Safari can add to home screen
      if (isSafari) {
        setPromptType('ios-safari');
        setDismissed(false);
      } else {
        // Chrome, Firefox, Edge, etc. on iOS
        setPromptType('ios-other');
        setDismissed(false);
      }
    } else {
      // For Android/Desktop, listen for beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPromptType('native');
        setDismissed(false);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setPromptType(null);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  const handleOpenInSafari = () => {
    // Copy current URL to clipboard for easy pasting
    navigator.clipboard?.writeText(window.location.href);
    // Show feedback then dismiss
    setTimeout(() => handleDismiss(), 1500);
  };

  if (dismissed || !promptType) {
    return null;
  }

  // iOS using non-Safari browser (Chrome, Firefox, etc.)
  if (promptType === 'ios-other') {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe">
        <div className="pointer-events-auto w-full max-w-md animate-bounce-in rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Compass className="h-6 w-6 text-white" />
                <h3 className="text-lg font-bold text-white">Open in Safari</h3>
              </div>
              <p className="text-sm text-white/90">
                To add this app to your home screen, you need to open it in Safari. Tap below to copy the link!
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleOpenInSafari}
            className="mt-3 w-full rounded-full bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Copy Link for Safari
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari - show share button instructions
  if (promptType === 'ios-safari') {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe">
        <div className="pointer-events-auto w-full max-w-md animate-bounce-in rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Share className="h-6 w-6 text-white" />
                <h3 className="text-lg font-bold text-white">Add to Home Screen</h3>
              </div>
              <p className="text-sm text-white/90">
                Tap the <span className="inline-flex items-center"><Share className="h-4 w-4 mx-1" /></span> share button, then scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Native install prompt (Android/Desktop Chrome)
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe">
      <div className="pointer-events-auto w-full max-w-md animate-bounce-in rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Download className="h-6 w-6 text-white" />
              <h3 className="text-lg font-bold text-white">Install App</h3>
            </div>
            <p className="text-sm text-white/90">
              Add to your home screen for a better experience and offline access!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full rounded-full bg-white px-6 py-3 font-bold text-purple-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Install Now
        </button>
      </div>
    </div>
  );
}

