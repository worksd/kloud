// 인앱 브라우저(카카오/인스타), 시크릿 모드, 샌드박스 iframe, 쿠키 차단 설정 등에서는
// storage 접근이 SecurityError로 막힌다. 중요한 건 getItem 호출이 아니라
// `window.sessionStorage` 프로퍼티를 '읽는' 순간 던진다는 점 —
// 그래서 호출부에서 try/catch로 감싸도 프로퍼티 접근 자체를 안 감싸면 못 막는다.
//
// 저장은 부가 기능(노출 1회 제한, 이메일 캐시 등)이라 실패해도 조용히 넘어간다.
// storage가 없으면 "저장된 값이 없다"와 동일하게 동작한다.

type StorageKind = 'local' | 'session';

const getStore = (kind: StorageKind): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const makeSafeStorage = (kind: StorageKind) => ({
  getItem: (key: string): string | null => {
    try {
      return getStore(kind)?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      getStore(kind)?.setItem(key, value);
    } catch {
      // 용량 초과(QuotaExceededError) 포함 — 무시
    }
  },
  removeItem: (key: string): void => {
    try {
      getStore(kind)?.removeItem(key);
    } catch {
    }
  },
  clear: (): void => {
    try {
      getStore(kind)?.clear();
    } catch {
    }
  },
});

export const safeLocalStorage = makeSafeStorage('local');
export const safeSessionStorage = makeSafeStorage('session');
