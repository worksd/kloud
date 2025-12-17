'use client'

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // 전역 에러 핸들러
    const handleError = (event: ErrorEvent) => {
      const error = {
        name: 'UnhandledError',
        message: event.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      };

      // Discord로 전송
      fetch('/api/error-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error,
          context: {
            pathname: window.location.pathname,
            route: window.location.pathname + window.location.search,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        }),
      }).catch(console.error);
    };

    // Promise rejection 핸들러
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = {
        name: 'UnhandledPromiseRejection',
        message: event.reason?.message || String(event.reason) || 'Unknown rejection',
        stack: event.reason?.stack || 'No stack trace',
      };

      // Discord로 전송
      fetch('/api/error-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error,
          context: {
            pathname: window.location.pathname,
            route: window.location.pathname + window.location.search,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(console.error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}

