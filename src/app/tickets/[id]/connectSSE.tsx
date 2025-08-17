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

  console.log('[SSE] connecting to', url);

  const es = new EventSourcePolyfill(url, {
    headers: {
      'x-guinness-device-name': 'asdf',
      'x-guinness-client': 'Android',
      'x-guinness-version': '2.0.0',
    },
    heartbeatTimeout: 30_000,
  });

  es.onopen = () => {
    console.log('[SSE] connection opened');
    onConnect?.();
  };

  es.addEventListener('ticket.used', (e) => {
    const raw = (e as MessageEvent).data;
    console.log('[SSE] ticket.used event received:', raw);

    try {
      const parsed = JSON.parse(raw);
      console.log('[SSE] parsed data:', parsed);
      onMessage(parsed);
    } catch {
      onMessage(raw);
    }
  });

  (es as any).addEventListener?.('connect', (e: MessageEvent) => {
    console.log('[SSE] connect event received:', e.data);
    onConnect?.();
  });

  es.onerror = (err: unknown) => {
    console.error('[SSE] error:', err);
    onError?.(err);
  };

  es.onmessage = (e) => {
    console.log('[SSE] default message event:', e.data);
    // 기본 message 채널도 받고 싶으면 여기서 onMessage 호출 가능
  };

  return es;
};