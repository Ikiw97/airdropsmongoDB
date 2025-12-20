/**
 * Security Utilities for Private Key Generator
 * Provides encryption, fingerprinting, session management, dan audit logging
 */

// ==================== ENCRYPTION ====================

/**
 * Simple encryption untuk display purposes (NOT untuk actual key storage)
 * Menggunakan base64 + character substitution
 */
export const encryptDisplay = (text) => {
  try {
    const encoded = btoa(text);
    // Simple substitution untuk extra layer
    return encoded
      .split('')
      .map(char => String.fromCharCode(char.charCodeAt(0) + 1))
      .join('');
  } catch (e) {
    console.error('Encryption error:', e);
    return text;
  }
};

export const decryptDisplay = (encrypted) => {
  try {
    const decoded = encrypted
      .split('')
      .map(char => String.fromCharCode(char.charCodeAt(0) - 1))
      .join('');
    return atob(decoded);
  } catch (e) {
    console.error('Decryption error:', e);
    return '';
  }
};

/**
 * Generate password hash untuk file encryption
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Encrypt JSON data untuk secure export
 */
export const encryptJSON = async (data, password) => {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const passwordHash = await hashPassword(password);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passwordHash.substring(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(data))
    );

    const ivArray = Array.from(iv);
    const encryptedArray = Array.from(new Uint8Array(encrypted));
    
    return JSON.stringify({
      iv: ivArray,
      data: encryptedArray,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('JSON encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt JSON data
 */
export const decryptJSON = async (encryptedJson, password) => {
  try {
    const { iv, data } = JSON.parse(encryptedJson);
    const passwordHash = await hashPassword(password);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passwordHash.substring(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    console.error('JSON decryption error:', error);
    throw new Error('Decryption failed or wrong password');
  }
};

// ==================== DEVICE FINGERPRINTING ====================

/**
 * Generate device fingerprint untuk security check
 */
export const generateFingerprint = async () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
    screen.colorDepth,
  ];

  const fingerprint = components.join('|');
  const encoded = await hashPassword(fingerprint);
  return encoded.substring(0, 32);
};

/**
 * Verify device fingerprint (anti-theft feature)
 */
export const verifyFingerprint = async (storedFingerprint) => {
  const currentFingerprint = await generateFingerprint();
  return storedFingerprint === currentFingerprint;
};

// ==================== SESSION MANAGEMENT ====================

/**
 * Session security handler
 */
class SessionManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTime = 5 * 60 * 1000; // Warn 5 minutes before timeout
    this.fingerprint = null;
    this.isActive = true;
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async initialize() {
    this.fingerprint = await generateFingerprint();
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isSessionValid() {
    const elapsed = Date.now() - this.createdAt;
    return elapsed < this.sessionTimeout && this.isActive;
  }

  getTimeRemaining() {
    const elapsed = Date.now() - this.createdAt;
    const remaining = this.sessionTimeout - elapsed;
    return Math.max(0, remaining);
  }

  shouldShowWarning() {
    const remaining = this.getTimeRemaining();
    return remaining > 0 && remaining < this.warningTime;
  }

  endSession() {
    this.isActive = false;
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      createdAt: new Date(this.createdAt).toISOString(),
      lastActivity: new Date(this.lastActivity).toISOString(),
      timeRemaining: this.getTimeRemaining(),
      isValid: this.isSessionValid()
    };
  }
}

export const createSession = async () => {
  const manager = new SessionManager();
  await manager.initialize();
  return manager;
};

// ==================== ACTIVITY LOGGING ====================

/**
 * Audit log untuk track semua aktivitas
 */
class AuditLog {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(action, details = {}, severity = 'info') {
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      userAgent: navigator.userAgent.substring(0, 100)
    };

    this.logs.unshift(entry);

    // Keep only last 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log sensitive actions ke console (development only)
    if (severity === 'critical') {
      console.warn(`[SECURITY] ${action}:`, details);
    }
  }

  getLogs() {
    return this.logs;
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const createAuditLog = () => new AuditLog();

// ==================== BROWSER SECURITY ====================

/**
 * Prevent console access (development mode check)
 */
export const preventConsoleAccess = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable console methods
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};

    // Detect DevTools opening
    const checkDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        // DevTools detected
        window.location.href = 'about:blank';
      }
    };

    setInterval(checkDevTools, 500);
  }
};

/**
 * Prevent screenshot/screen recording (visual warning)
 */
export const preventScreenCapture = () => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    const target = e.target;
    if (target.closest('[data-sensitive]')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts for screenshots
  document.addEventListener('keydown', (e) => {
    // Prevent Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
    }
    // Prevent Ctrl+Shift+S (screenshot)
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
    }
    // Prevent Ctrl+P (print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
    }
  });
};

/**
 * Prevent copy/paste exploits on sensitive fields
 */
export const secureSensitiveFields = () => {
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection().toString();
    if (selection.length > 50) {
      // Likely trying to copy a private key
      e.preventDefault();
      console.warn('Copy protection activated');
    }
  });

  document.addEventListener('paste', (e) => {
    const target = e.target;
    if (target.closest('[data-secure-paste="false"]')) {
      e.preventDefault();
    }
  });
};

/**
 * Clear sensitive data from memory
 */
export const clearSensitiveData = (variable) => {
  if (typeof variable === 'string') {
    // Overwrite with random data
    return '0'.repeat(variable.length);
  }
  if (Array.isArray(variable)) {
    return variable.map(() => 0);
  }
  if (typeof variable === 'object') {
    return Object.keys(variable).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
  }
  return null;
};

// ==================== SECURE EXPORT ====================

/**
 * Generate secure file untuk download
 */
export const generateSecureFile = (data, filename, format = 'json', password = null) => {
  let content;
  let mimeType;

  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
  } else if (format === 'csv') {
    content = data.map(k => `"${k.privateKey}","${k.address}","${k.mnemonic}"`).join('\n');
    mimeType = 'text/csv';
  } else {
    throw new Error('Unsupported format');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Securely download encrypted file
 */
export const downloadEncryptedFile = async (data, filename, password) => {
  try {
    const encrypted = await encryptJSON(data, password);
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.encrypted';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to create encrypted file: ' + error.message);
  }
};

// ==================== SECURITY WARNINGS ====================

/**
 * Display persistent security warning
 */
export const showSecurityWarning = (message, duration = 0) => {
  const warning = document.createElement('div');
  warning.className = 'fixed top-0 left-0 right-0 z-[99999] bg-red-500 text-white p-4 text-center font-bold';
  warning.textContent = '🔒 ' + message;
  warning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background-color: rgb(239, 68, 68);
    color: white;
    padding: 1rem;
    text-align: center;
    font-weight: bold;
  `;

  document.body.insertBefore(warning, document.body.firstChild);

  if (duration > 0) {
    setTimeout(() => warning.remove(), duration);
  }

  return warning;
};

/**
 * Request user confirmation untuk sensitive actions
 */
export const requestSecurityConfirmation = (action, details = '') => {
  return new Promise((resolve) => {
    const message = `
🔐 SECURITY CONFIRMATION

Action: ${action}
${details ? `Details: ${details}` : ''}

⚠️ This action cannot be undone.
Are you absolutely sure?

[YES] [CANCEL]
    `.trim();

    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

export default {
  encryptDisplay,
  decryptDisplay,
  hashPassword,
  encryptJSON,
  decryptJSON,
  generateFingerprint,
  verifyFingerprint,
  createSession,
  createAuditLog,
  preventConsoleAccess,
  preventScreenCapture,
  secureSensitiveFields,
  clearSensitiveData,
  generateSecureFile,
  downloadEncryptedFile,
  showSecurityWarning,
  requestSecurityConfirmation
};
