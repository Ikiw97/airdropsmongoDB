import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'
import { secureLogger } from './utils/dataSecurityUtils'

// ==================== PRODUCTION SECURITY ====================

// Disable console methods di production untuk security
if (import.meta.env.PROD) {
  // Disable console logs
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};

  // Keep console.error but sanitize it
  const originalError = console.error;
  console.error = function(...args) {
    // Only log non-sensitive errors
    const safeError = args[0]?.message || String(args[0]);
    if (!safeError.includes('token') && !safeError.includes('password')) {
      originalError.apply(console, ['[ERROR]', safeError]);
    }
  };

  // Disable copy/paste pada sensitive fields globally
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection().toString();
    if (selection && selection.length > 50) {
      e.preventDefault();
      secureLogger.log('COPY_ATTEMPT_BLOCKED', { length: selection.length }, 'warning', true);
    }
  });

  // Detect DevTools opening
  let devtools = { open: false };
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 160 ||
        window.outerWidth - window.innerWidth > 160) {
      if (!devtools.open) {
        devtools.open = true;
        secureLogger.log('DEVTOOLS_DETECTED', {}, 'critical', true);
        // Redirect or disable
        // window.location.href = 'about:blank';
      }
    } else {
      devtools.open = false;
    }
  }, 500);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker Registration - Secure version
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        secureLogger.log('SERVICE_WORKER_REGISTERED', {}, 'info', true);
      })
      .catch((err) => {
        secureLogger.logError('SERVICE_WORKER_ERROR', err, {});
      });
  });
}
