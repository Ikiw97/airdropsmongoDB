import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'
import { secureLogger } from './utils/dataSecurityUtils'

// ==================== WALLET PROVIDER SAFETY ====================
// Prevent wallet library conflicts by wrapping ethereum property redefinition
if (typeof window !== 'undefined' && !window.ethereum) {
  // Create a safe proxy for ethereum if it doesn't exist
  // This prevents "Cannot redefine property" errors when multiple wallet libraries load
  const createEthereumProxy = () => {
    return new Proxy({}, {
      get(target, prop) {
        // Forward all property access to the actual window.ethereum if it exists
        if (window.ethereum && window.ethereum[prop]) {
          return window.ethereum[prop];
        }
        return target[prop];
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    });
  };

  // Allow window.ethereum to be set once by the wallet library
  let ethereumProxy = createEthereumProxy();
  Object.defineProperty(window, 'ethereum', {
    get() {
      return ethereumProxy;
    },
    set(value) {
      // Update the actual value when wallet library sets it
      ethereumProxy = value || createEthereumProxy();
    },
    configurable: true, // Allow redefinition
  });
}

// Handle wallet injection errors gracefully
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Cannot redefine property: ethereum')) {
    // Suppress this error - it's a wallet library issue, not our app's fault
    console.warn('Wallet library conflict detected but handled gracefully');
    event.preventDefault();
  }
}, true);

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
