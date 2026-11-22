'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getPublicAssetPath } from '@/lib/assetPath';

function subscribeOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getClientOnlineStatus(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerOnlineStatus(): boolean {
  return true;
}

export default function ServiceWorkerRegistrar() {
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getClientOnlineStatus,
    getServerOnlineStatus
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const swUrl = getPublicAssetPath('/sw.js');
    const scope = getPublicAssetPath('/');
    navigator.serviceWorker.register(swUrl, { scope }).catch(() => {
      // Service worker registration can be blocked in private/file modes; app still runs normally
    });
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(79, 110, 247, 0.45)',
        color: '#7C9FFF',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
      }}
    >
      Offline mode active
    </div>
  );
}
