import { Middleware } from '@reduxjs/toolkit';

// Custom middleware for logging actions
export const loggerMiddleware: Middleware = store => next => (action: any) => {
  console.group(`%c Action: ${action.type}`, 'color: #4CAF50; font-weight: bold');
  console.log('%c Previous State:', 'color: #9E9E9E; font-weight: bold', store.getState());
  console.log('%c Action:', 'color: #03A9F4; font-weight: bold', action);
  
  // Call the next dispatch method in the middleware chain
  const returnValue = next(action);
  
  console.log('%c Next State:', 'color: #FF5722; font-weight: bold', store.getState());
  console.groupEnd();
  
  return returnValue;
};
