export const KloudScreen = {
  Main: '/main',
  Onboard: '/onboarding',
  Login: '/login',
  LoginEmail: '/login/email',
  SignUp: '/signUp',
  Home: '/home',
  Lessons: '/lessons',
  LessonDetail: (id: number) => `/lessons/${id}`,
  LessonPayment: (id: number) => `/lessons/${id}/payment`,
  TicketDetail: (id: number) => `/tickets/${id}`,
  StudioDetail: (id: number) => `/studios/${id}`,
} as const;

type KloudScreenKey = keyof typeof KloudScreen;