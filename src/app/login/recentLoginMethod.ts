import { safeLocalStorage } from "@/utils/safe.storage";

export type LoginMethod = 'apple' | 'google' | 'kakao' | 'phone' | 'email';

const RECENT_LOGIN_METHOD_KEY = 'kloud_recent_login_method';

export const saveRecentLoginMethod = (method: LoginMethod) => {
  safeLocalStorage.setItem(RECENT_LOGIN_METHOD_KEY, method);
};

export const getRecentLoginMethod = (): LoginMethod | null => {
  return safeLocalStorage.getItem(RECENT_LOGIN_METHOD_KEY) as LoginMethod | null;
};
