'use client';

import { useEffect } from 'react';

// Registers the service worker that makes the app installable and offline-capable.
export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch((error) => {
          console.error('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  return null;
}
