'use client';

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
  minLevel: LogLevel.DEBUG
};

// Helper to format log messages
const formatMessage = (level: LogLevel, context: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${context}] ${message}`;
};

// Main logger function
export const logger = {
  firestore: {
    debug: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.DEBUG >= config.minLevel) {
        console.debug(formatMessage(LogLevel.DEBUG, 'Firestore', message), data || '');
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.INFO >= config.minLevel) {
        console.info(formatMessage(LogLevel.INFO, 'Firestore', message), data || '');
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.WARN >= config.minLevel) {
        console.warn(formatMessage(LogLevel.WARN, 'Firestore', message), data || '');
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableFirestoreLogs && LogLevel.ERROR >= config.minLevel) {
        console.error(formatMessage(LogLevel.ERROR, 'Firestore', message), data || '');
      }
    }
  },
  cart: {
    debug: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.DEBUG >= config.minLevel) {
        console.debug(formatMessage(LogLevel.DEBUG, 'Cart', message), data || '');
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.INFO >= config.minLevel) {
        console.info(formatMessage(LogLevel.INFO, 'Cart', message), data || '');
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.WARN >= config.minLevel) {
        console.warn(formatMessage(LogLevel.WARN, 'Cart', message), data || '');
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableCartLogs && LogLevel.ERROR >= config.minLevel) {
        console.error(formatMessage(LogLevel.ERROR, 'Cart', message), data || '');
      }
    }
  },
  auth: {
    debug: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.DEBUG >= config.minLevel) {
        console.debug(formatMessage(LogLevel.DEBUG, 'Auth', message), data || '');
      }
    },
    info: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.INFO >= config.minLevel) {
        console.info(formatMessage(LogLevel.INFO, 'Auth', message), data || '');
      }
    },
    warn: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.WARN >= config.minLevel) {
        console.warn(formatMessage(LogLevel.WARN, 'Auth', message), data || '');
      }
    },
    error: (message: string, data?: any) => {
      if (config.enableAuthLogs && LogLevel.ERROR >= config.minLevel) {
        console.error(formatMessage(LogLevel.ERROR, 'Auth', message), data || '');
      }
    }
  }
};
