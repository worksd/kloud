'use client';

import { useEffect, useRef } from 'react';
import { AnalyticsEvent, AnalyticsProps, trackEvent } from '@/app/lib/analytics';

/**
 * 화면 진입 이벤트를 마운트 시 1회 전송한다. 서버(RSC)가 아니라 클라에서 쏘는 이유는
 * RSC는 프리페치·재실행으로도 돌아서 실제 노출보다 부풀기 때문.
 *
 * StrictMode의 이중 마운트와 리렌더에서 중복 전송되지 않도록 ref로 한 번만 보낸다.
 * 화면당 하나만 두고, 아무것도 렌더하지 않는다.
 */
export const TrackView = ({ event, props }: { event: AnalyticsEvent; props?: AnalyticsProps }) => {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(event, props);
    // props는 매 렌더 새 객체로 오기 쉬워 의존성에서 뺀다 — 어차피 1회만 보낸다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
};
