/**
 * Data Security Utilities
 * Handles sanitization, masking, encryption untuk sensitive project data
 */

// ==================== CONFIGURATION ====================

const SENSITIVE_FIELDS = [
  'privateKey',
  'privatekey',
  'private_key',
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'access_token',
  'refresh_token',
  'wallet',
  'seed',
  'mnemonic',
  'email',
  'phone',
  'ssn',
  'creditCard',
  'bankAccount'
];

const SAFE_TO_LOG_FIELDS = [
  'id',
  'name',
  'title',
  'status',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
  'type',
  'category',
  'tags',
  'notes',
  'daily'
];

// ==================== SECURE LOGGING ====================

/**
 * Safe logger - hanya log non-sensitive data
 */
class SecureLogger {
  constructor(enableConsole = false) {
    this.enableConsole = enableConsole && process.env.NODE_ENV === 'development';
    this.logs = [];
    this.maxLogs = 500;
  }

  /**
   * Check if field contains sensitive data
   */
  isSensitiveField(key) {
    const lowerKey = key.toLowerCase();
    return SENSITIVE_FIELDS.some(field =>
      lowerKey.includes(field.toLowerCase())
    );
  }

  /**
   * Check if safe to log
   */
  isSafeToLog(key) {
    const lowerKey = key.toLowerCase();
    return SAFE_TO_LOG_FIELDS.some(field =>
      lowerKey.includes(field.toLowerCase())
    );
  }

  /**
   * Sanitize object untuk logging (remove sensitive fields)
   */
  sanitizeData(data) {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.maskString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Mask sensitive strings
   */
  maskString(str) {
    if (typeof str !== 'string') return str;

    // Check if string looks like private key (0x... atau 256 chars)
    if (str.startsWith('0x') || str.length > 60) {
      return str.substring(0, 6) + '...' + str.substring(str.length - 4);
    }

    // Check if looks like email
    if (str.includes('@')) {
      const [name, domain] = str.split('@');
      return name.substring(0, 2) + '***@' + domain;
    }

    // Check if looks like wallet address (0x...)
    if (str.startsWith('0x') && str.length === 42) {
      return str.substring(0, 6) + '...' + str.substring(38);
    }

    return str;
  }

  /**
   * Main logging method
   */
  log(action, data = {}, severity = 'info', forceLog = false) {
    // Jangan log di production kecuali critical
    if (process.env.NODE_ENV === 'production' && severity !== 'critical' && !forceLog) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      action,
      severity,
      data: this.sanitizeData(data),
      stackTrace: this.getStackTrace()
    };

    this.logs.unshift(entry);

    // Keep only last X logs
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log ke console if enabled
    if (this.enableConsole) {
      const color = severity === 'error' ? 'color:red' :
        severity === 'warning' ? 'color:orange' :
        severity === 'critical' ? 'color:darkred' :
        'color:blue';

      console.log(`%c[${action}]`, color, entry.data);
    }
  }

  /**
   * Get stack trace untuk debugging (production safe)
   */
  getStackTrace() {
    if (process.env.NODE_ENV === 'production') {
      return undefined; // Jangan expose stack trace di production
    }

    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(3, 5).join('\n') : undefined;
  }

  /**
   * Log error dengan sanitasi
   */
  logError(action, error, context = {}) {
    const errorData = {
      message: error?.message || 'Unknown error',
      context: this.sanitizeData(context)
    };

    this.log(action, errorData, 'error', true);
  }

  /**
   * Export logs untuk audit
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }
    if (format === 'csv') {
      return this.logsToCSV();
    }
    return this.logs;
  }

  /**
   * Convert logs to CSV format
   */
  logsToCSV() {
    const headers = ['Timestamp', 'Action', 'Severity'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.action,
      log.severity
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get all logs
   */
  getLogs() {
    return this.logs;
  }
}

export const secureLogger = new SecureLogger(false);

// ==================== DATA SANITIZATION ====================

/**
 * Sanitize user input untuk prevent injection
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'`]/g, '')
    .trim();
};

/**
 * Mask sensitive data dalam display
 */
export const maskData = (data, type = 'default') => {
  if (!data) return '';

  const str = String(data);

  switch (type) {
    case 'email':
      const [name, domain] = str.split('@');
      return name.substring(0, 2) + '****@' + domain;

    case 'wallet':
    case 'address':
      return str.substring(0, 6) + '...' + str.substring(str.length - 4);

    case 'privateKey':
    case 'secret':
      return str.substring(0, 4) + '••••••••' + str.substring(str.length - 4);

    case 'phone':
      return '***-***-' + str.substring(str.length - 4);

    case 'ssn':
      return '***-**-' + str.substring(str.length - 4);

    case 'creditCard':
      return '****-****-****-' + str.substring(str.length - 4);

    default:
      return str.substring(0, 3) + '*'.repeat(Math.max(0, str.length - 7)) + str.substring(str.length - 3);
  }
};

/**
 * Mask project object untuk safe logging
 */
export const maskProjectData = (project) => {
  if (!project) return project;

  const masked = { ...project };

  // Mask sensitive fields
  if (masked.wallet) masked.wallet = maskData(masked.wallet, 'wallet');
  if (masked.email) masked.email = maskData(masked.email, 'email');
  if (masked.twitter) masked.twitter = '[REDACTED]';
  if (masked.discord) masked.discord = '[REDACTED]';
  if (masked.telegram) masked.telegram = '[REDACTED]';
  if (masked.github) masked.github = '[REDACTED]';

  return masked;
};

// ==================== DATA ENCRYPTION FOR STORAGE ====================

/**
 * Encrypt data untuk localStorage
 */
export const encryptStorageData = async (data, key = 'default') => {
  try {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonString);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Generate key from string
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(16),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      encodedData
    );

    const ivArray = Array.from(iv);
    const encryptedArray = Array.from(new Uint8Array(encrypted));

    return JSON.stringify({
      iv: ivArray,
      data: encryptedArray
    });
  } catch (error) {
    secureLogger.logError('ENCRYPT_STORAGE_ERROR', error);
    throw error;
  }
};

/**
 * Decrypt data dari localStorage
 */
export const decryptStorageData = async (encryptedJson, key = 'default') => {
  try {
    const { iv, data } = JSON.parse(encryptedJson);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(16),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      derivedKey,
      new Uint8Array(data)
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    secureLogger.logError('DECRYPT_STORAGE_ERROR', error);
    throw error;
  }
};

// ==================== ACCESS CONTROL ====================

/**
 * Check user permissions untuk project
 */
export const checkProjectAccess = (user, project, action = 'read') => {
  if (!user || !project) return false;

  // Admin has full access
  if (user.is_admin) return true;

  // User can only access their own projects
  if (project.userId !== user.id && project.user_id !== user.id) {
    secureLogger.log('UNAUTHORIZED_ACCESS_ATTEMPT', {
      action,
      projectId: project.id
    }, 'warning');
    return false;
  }

  // User can read/write own projects
  if (action === 'read' || action === 'write' || action === 'delete') {
    return true;
  }

  return false;
};

/**
 * Filter projects berdasarkan user access
 */
export const filterProjectsByAccess = (projects, user) => {
  if (!user) return [];
  if (user.is_admin) return projects; // Admin sees all

  return projects.filter(project =>
    project.userId === user.id || project.user_id === user.id
  );
};

/**
 * Sanitize project sebelum send ke client
 */
export const sanitizeProjectForClient = (project) => {
  // Remove sensitive backend fields
  const { created_at, updated_at, ...sanitized } = project;

  return sanitized;
};

// ==================== API RESPONSE SAFETY ====================

/**
 * Validate API response safety
 */
export const validateApiResponse = (response) => {
  // Check for sensitive fields in response
  const sensitiveFieldsFound = SENSITIVE_FIELDS.filter(field =>
    JSON.stringify(response).toLowerCase().includes(field.toLowerCase())
  );

  if (sensitiveFieldsFound.length > 0 && process.env.NODE_ENV === 'production') {
    secureLogger.log('SENSITIVE_DATA_IN_RESPONSE', {
      fields: sensitiveFieldsFound
    }, 'critical', true);

    // Clean response of sensitive data
    return sanitizeResponseData(response);
  }

  return response;
};

/**
 * Remove sensitive data dari API response
 */
export const sanitizeResponseData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponseData(item));
  }

  if (typeof data === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (!SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        cleaned[key] = typeof value === 'object'
          ? sanitizeResponseData(value)
          : value;
      }
    }
    return cleaned;
  }

  return data;
};

// ==================== MEMORY CLEANUP ====================

/**
 * Secure memory cleanup
 */
export const clearSensitiveMemory = (variable) => {
  if (typeof variable === 'string') {
    return '0'.repeat(variable.length);
  }
  if (Array.isArray(variable)) {
    return variable.map(() => null);
  }
  if (typeof variable === 'object') {
    return Object.keys(variable).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
  }
  return null;
};

export default {
  secureLogger,
  sanitizeInput,
  maskData,
  maskProjectData,
  encryptStorageData,
  decryptStorageData,
  checkProjectAccess,
  filterProjectsByAccess,
  sanitizeProjectForClient,
  validateApiResponse,
  sanitizeResponseData,
  clearSensitiveMemory
};
