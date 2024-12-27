export const KloudScreen = {
  Main: '/main',
  Onboard: '/onboarding',
  Login: '/login',
  LoginEmail: '/login/email',
  SignUp: '/signUp',
  Home: '/home',
  LessonDetail: (id: number) => `/lessons/${id}`,
  StudioDetail: (id: number) => `/studios/${id}`,
} as const;

type KloudScreenKey = keyof typeof KloudScreen;