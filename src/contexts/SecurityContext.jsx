import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSession, createAuditLog, showSecurityWarning } from '../utils/securityUtils';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(true);

  // Initialize session dan audit log
  useEffect(() => {
    const initializeSession = async () => {
      const newSession = await createSession();
      setSession(newSession);
      
      const newAuditLog = createAuditLog();
      setAuditLog(newAuditLog);
      
      newAuditLog.log('SESSION_CREATED', {
        sessionId: newSession.sessionId,
        fingerprint: newSession.fingerprint
      }, 'info');
    };

    initializeSession();
  }, []);

  // Check session validity every 10 seconds
  useEffect(() => {
    if (!session) return;

    const checkInterval = setInterval(() => {
      const remaining = session.getTimeRemaining();
      const isValid = session.isSessionValid();

      setIsSessionValid(isValid);

      // Show warning when 5 minutes remaining
      if (session.shouldShowWarning() && !sessionWarning) {
        setSessionWarning(true);
        auditLog?.log('SESSION_WARNING', {
          timeRemaining: remaining,
          message: 'Session expiring soon'
        }, 'warning');
      }

      // End session when timeout reached
      if (!isValid) {
        session.endSession();
        auditLog?.log('SESSION_EXPIRED', {
          duration: Date.now() - session.createdAt
        }, 'critical');
        
        showSecurityWarning('⏱️ Your security session has expired. Please refresh the page.', 0);
        setSessionWarning(false);
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [session, sessionWarning, auditLog]);

  // Update activity on user interaction
  useEffect(() => {
    if (!session) return;

    const updateActivity = () => {
      session.updateActivity();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [session]);

  const logActivity = (action, details = {}, severity = 'info') => {
    if (auditLog) {
      auditLog.log(action, details, severity);
    }
  };

  const getSessionStatus = () => {
    if (!session) return null;
    return {
      isValid: isSessionValid,
      timeRemaining: session.getTimeRemaining(),
      sessionId: session.sessionId,
      warning: sessionWarning
    };
  };

  const getAuditLogs = () => {
    return auditLog ? auditLog.getLogs() : [];
  };

  const exportAuditLogs = () => {
    return auditLog ? auditLog.exportLogs() : '[]';
  };

  const clearAuditLogs = () => {
    if (auditLog) {
      auditLog.clearLogs();
      logActivity('AUDIT_LOGS_CLEARED', {}, 'critical');
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        session,
        auditLog,
        logActivity,
        getSessionStatus,
        getAuditLogs,
        exportAuditLogs,
        clearAuditLogs,
        sessionWarning,
        isSessionValid
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};
