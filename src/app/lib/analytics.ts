// 'use client' 없음 — 의도된 공유 모듈이다.
// resolveBandEvent와 이벤트 타입은 서버 컴포넌트(LessonBand 등)에서도 쓰는데,
// 'use client'를 붙이면 서버에서 import한 export가 전부 클라이언트 참조가 되어
// 호출하는 순간 SSR이 죽는다 ("Attempted to call ... from the server").
// trackEvent는 클라이언트에서만 동작하고, 서버에서 호출되면 조용히 no-op 한다.

import { track } from '@vercel/analytics';

/**
 * Vercel Web Analytics 커스텀 이벤트 이름.
 *
 * 새 이벤트를 추가할 땐 반드시 여기에 먼저 넣는다 — 대시보드에서 오타 난 이름이 별도 이벤트로
 * 쌓이면 되돌릴 방법이 없다.
 *
 *  - enter_*  화면 진입 (TrackView가 마운트 시 1회 전송)
 *  - click_*  사용자 액션
 */
export type AnalyticsEvent =
  // 화면 진입
  | 'enter_home'
  | 'enter_schedule'
  | 'enter_profile'
  | 'enter_community'
  | 'enter_kiosk_lesson'
  | 'enter_lesson'
  | 'enter_studio'
  | 'enter_payment'
  // 액션
  | 'click_payment_button'
  // 홈 밴드 — 밴드 종류별로 이름이 갈린다 (resolveBandEvent 참고)
  | 'click_band_today'
  | 'click_band_timetable'
  | 'click_band_my_ticket'
  | 'click_band_new'
  | 'click_band_upcoming'
  | 'click_band_recommendation'
  /** 위 어디에도 안 걸리는 일반 밴드 — bandTitle로 구분한다 (분류 누락을 눈에 보이게 하려는 폴백) */
  | 'click_band';

/**
 * 홈 밴드 → 클릭 이벤트 이름.
 *
 * 밴드는 BE가 내려주는 것이라 클라가 아는 식별자는 type/label/title뿐이다.
 * type·label은 구조값이라 안전하지만 '내 수강권' 밴드는 제목으로밖에 못 가른다 —
 * BE가 밴드에 안정적인 key를 추가하면 그걸로 갈아타는 게 맞다.
 *
 * 어디에도 안 걸리는 일반 밴드는 click_band로 떨어뜨리고 bandTitle을 함께 보낸다.
 * (조용히 버리면 대시보드에서 "그 밴드는 아무도 안 누른다"로 잘못 읽힌다)
 */
export const resolveBandEvent = ({ type, label, title }: {
  type?: 'Default' | 'Recommendation' | 'Today';
  label?: { coming?: boolean; new?: boolean };
  title?: string;
}): AnalyticsEvent => {
  if (type === 'Today') return 'click_band_today';
  if (type === 'Recommendation') return 'click_band_recommendation';
  if (label?.new) return 'click_band_new';
  if (label?.coming) return 'click_band_upcoming';
  if (title && /수강권|ticket/i.test(title)) return 'click_band_my_ticket';
  return 'click_band';
};

/**
 * 커스텀 데이터 값 제약 (Vercel):
 * 문자열/숫자/불리언/null 만 가능하고 중첩 객체는 불가. 키·값 모두 255자 이하.
 */
export type AnalyticsProps = Record<string, string | number | boolean | null>;

/** 255자 초과 값은 서버에서 거절되므로 잘라서 보낸다. */
const clamp = (value: string) => (value.length > 255 ? value.slice(0, 255) : value);

const sanitize = (props?: AnalyticsProps): AnalyticsProps | undefined => {
  if (!props) return undefined;
  const out: AnalyticsProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    out[clamp(key)] = typeof value === 'string' ? clamp(value) : value;
  }
  return out;
};

/**
 * 이벤트 전송. 분석은 부가 기능이라 실패해도 화면 동작을 막지 않는다 —
 * track()이 어떤 이유로든 던져도 삼킨다.
 */
export const trackEvent = (event: AnalyticsEvent, props?: AnalyticsProps) => {
  // 서버(SSR/RSC)에서 실수로 호출돼도 크래시 없이 무시 — @vercel/analytics의 track은 브라우저 전용이다.
  if (typeof window === 'undefined') return;
  try {
    track(event, sanitize(props));
  } catch {
    /* 분석 실패는 무시 */
  }
};
