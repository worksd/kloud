import { EventSourcePolyfill } from 'event-source-polyfill';
export const connectSSE = (
  url: string,
  onMessage: (data: unknown) => void,
  onConnect?: () => void,
  onError?: (error: unknown) => void,
) => {
  if (typeof window === 'undefined') {
    throw new Error('connectSSE must run in the browser');
  }
  const es = new EventSourcePolyfill(url, {
    headers: {
      'x-guinness-device-name': 'SSE Device',
      'x-guinness-client': 'Android',
      'x-guinness-version': '2.0.0',
    },
    heartbeatTimeout: 30_000,
  });

  es.onopen = () => {
    onConnect?.();
  };

  es.addEventListener('ticket.used', (e) => {
    const raw = (e as MessageEvent).data;

    try {
      const parsed = JSON.parse(raw);
      onMessage(parsed);
    } catch {
      onMessage(raw);
    }
  });

  es.addEventListener('payment.completed', (e) => {
    const raw = (e as MessageEvent).data;

    try {
      const parsed = JSON.parse(raw);
      onMessage(parsed);
    } catch {
      onMessage(raw);
    }
  });

  (es as any).addEventListener?.('connect', (e: MessageEvent) => {
    onConnect?.();
  });

  es.onerror = (err: unknown) => {
    onError?.(err);
  };

  es.onmessage = (e) => {
    // 기본 message 채널도 받고 싶으면 여기서 onMessage 호출 가능
  };

  return es;
};