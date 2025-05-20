// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Logger configuration
const config = {
  enableFirestoreLogs: true,
  enableCartLogs: true,
  enableAuthLogs: true,
  enableOrderLogs: true,
  enablePaymentLogs: true,
  enableDBLogs: true,
  minLevel: LogLevel.DEBUG
};

// Helper to format log messages
const formatMessage = (level: LogLevel, context: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${context}] ${message}`;
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Safe console methods that work in both client and server
const safeConsole = {
  debug: (message: string, data?: any) => {
    if (isBrowser) {
      console.debug(message, data || '');
    } else {
      console.log(message, data || '');
    }
  },
  info: (message: string, data?: any) => {
    if (isBrowser) {
      console.info(message, data || '');
    } else {
      console.log(message, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    if (isBrowser) {
      console.warn(message, data || '');
    } else {
      console.log(message, data || '');
    }
  },
  error: (message: string, data?: any) => {
    if (isBrowser) {
      console.error(message, data || '');
    } else {
      console.log(message, data || '');
    }
  }
};

// Main logger function
export const logger = {
  firestore: {
    debug: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'Firestore', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'Firestore', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'Firestore', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'Firestore', message), data);
      }
    }
  },
  db: {
    debug: (message: string, data?: any) => {
      if (config.enableDBLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'MongoDB', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableDBLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'MongoDB', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableDBLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'MongoDB', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableDBLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'MongoDB', message), data);
      }
    }
  },
  cart: {
    debug: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'Cart', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'Cart', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'Cart', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'Cart', message), data);
      }
    }
  },
  auth: {
    debug: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'Auth', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'Auth', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'Auth', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'Auth', message), data);
      }
    }
  },
  order: {
    debug: (message: string, data?: any) => {
      if (config.enableOrderLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'Order', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableOrderLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'Order', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableOrderLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'Order', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableOrderLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'Order', message), data);
      }
    }
  },
  payment: {
    debug: (message: string, data?: any) => {
      if (config.enablePaymentLogs && LogLevel.DEBUG >= config.minLevel) {
        safeConsole.debug(formatMessage(LogLevel.DEBUG, 'Payment', message), data);
      }
    },
    info: (message: string, data?: any) => {
      if (config.enablePaymentLogs && LogLevel.INFO >= config.minLevel) {
        safeConsole.info(formatMessage(LogLevel.INFO, 'Payment', message), data);
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enablePaymentLogs && LogLevel.WARN >= config.minLevel) {
        safeConsole.warn(formatMessage(LogLevel.WARN, 'Payment', message), data);
      }
    },
    error: (message: string, data?: any) => {
      if (config.enablePaymentLogs && LogLevel.ERROR >= config.minLevel) {
        safeConsole.error(formatMessage(LogLevel.ERROR, 'Payment', message), data);
      }
    }
  }
};
