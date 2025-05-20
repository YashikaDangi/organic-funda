'use client';

import { logger } from '@/utils/logger';

/**
 * Event types for analytics tracking
 */
export type AnalyticsEventType = 
  | 'CHECKOUT_START'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'PAYMENT_PROCESSING_ERROR'
  | 'ORDER_PLACED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED';

/**
 * Track an analytics event
 * @param eventType Type of event to track
 * @param eventData Additional data for the event
 */
export const trackEvent = (eventType: AnalyticsEventType, eventData?: Record<string, any>) => {
  // Log the event for debugging
  logger.payment.info(`Analytics event: ${eventType}`, { eventType, ...eventData });
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Here you would typically send the event to your analytics provider
    // For example, if using Google Analytics:
    if (window.gtag) {
      window.gtag('event', eventType, eventData);
    }
    
    // If using Facebook Pixel:
    if (window.fbq) {
      window.fbq('trackCustom', eventType, eventData);
    }
    
    // You can add more analytics providers as needed
  } catch (error) {
    // Don't let analytics errors affect the application
    logger.payment.error('Error tracking analytics event', { error, eventType, eventData });
  }
};

// Add TypeScript definitions for window properties
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}
