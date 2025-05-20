declare module '@/utils/analytics' {
  export type AnalyticsEventType = 
    | 'CHECKOUT_START'
    | 'PAYMENT_INITIATED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILURE'
    | 'PAYMENT_PROCESSING_ERROR'
    | 'ORDER_PLACED'
    | 'ORDER_COMPLETED'
    | 'ORDER_CANCELLED';

  export function trackEvent(eventType: AnalyticsEventType, eventData?: Record<string, any>): void;
}
