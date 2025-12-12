'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [mounted, setMounted] = useState(false)

  const DISMISS_STORAGE_KEY = 'install_prompt_dismissed_at'
  const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

  useEffect(() => {
    setMounted(true)
    
    try {
      const ua = navigator.userAgent
      const isiOSDevice = /iPad|iPhone|iPod/.test(ua) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      setIsIOS(isiOSDevice)

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return
      }

      // Check if already installed on iOS
      if ((window.navigator as any).standalone) {
        return
      }

      // Check localStorage for dismiss timing
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY)
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt)
        const now = Date.now()
        if (now - dismissedTime < DISMISS_DURATION) {
          return
        }
      }

      // Show install prompt for iOS users immediately
      if (isiOSDevice) {
        setShowInstallPrompt(true)
      }

      // Listen for the beforeinstallprompt event (Android/Desktop only)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowInstallPrompt(true)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    } catch (error) {
      console.error('Error in InstallPrompt:', error)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString())
    } catch (e) {
      // localStorage might not be available
    }
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) return null
  
  // Don't show if not needed
  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-bounce-in">
      <div className="rounded-2xl bg-white p-4 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isIOS ? 'Add to Home Screen' : 'Install App'}
              </h3>
              <p className="text-xs text-gray-500">
                {isIOS ? 'For quick access' : 'Add to your device'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span className="text-gray-600">Tap the Share button <span className="inline-block">⬆️</span></span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="text-gray-600">Tap &quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
