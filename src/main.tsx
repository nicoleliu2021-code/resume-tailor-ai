import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAnalytics } from './services/analytics'
import { captureReferralCode } from './services/referralService'

// Initialize analytics on app load
initializeAnalytics();

// Capture referral code if present in URL
captureReferralCode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// EMERGENCY FIX: Unregister all service workers that might be causing issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('[PWA] Service worker unregistered');
      });
    }
  });
}

// Register Service Worker for PWA functionality - TEMPORARILY DISABLED
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('[PWA] Service Worker registered successfully:', registration.scope);

//         // Check for updates periodically
//         setInterval(() => {
//           registration.update();
//         }, 60000); // Check every minute

//         // Listen for updates
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           if (newWorker) {
//             newWorker.addEventListener('statechange', () => {
//               if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//                 // New service worker is available, prompt user to reload
//                 if (confirm('A new version of ResumeFit is available. Reload to update?')) {
//                   window.location.reload();
//                 }
//               }
//             });
//           }
//         });
//       })
//       .catch((error) => {
//         console.error('[PWA] Service Worker registration failed:', error);
//       });
//   });
// }

// Handle install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt available');

  // Show custom install button (you can add this to your UI)
  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all z-50';
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.remove();
    }
  });

  // Only show install button if not already installed
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    setTimeout(() => {
      document.body.appendChild(installButton);
    }, 3000); // Show after 3 seconds
  }
});

// Track if app was launched as PWA
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
});

// Detect if running as installed PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('[PWA] Running as installed app');
}
