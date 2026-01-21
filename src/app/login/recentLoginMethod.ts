export type LoginMethod = 'apple' | 'google' | 'kakao' | 'phone' | 'email';

const RECENT_LOGIN_METHOD_KEY = 'kloud_recent_login_method';

export const saveRecentLoginMethod = (method: LoginMethod) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECENT_LOGIN_METHOD_KEY, method);
  }
};

export const getRecentLoginMethod = (): LoginMethod | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(RECENT_LOGIN_METHOD_KEY) as LoginMethod | null;
};
