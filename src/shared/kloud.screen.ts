export const KloudScreen = {
  Main: '/main',
  Onboard: '/onboarding',
  Login: '/login',
  LoginEmail: '/login/email',
  LoginDeactivate: '/login/deactivate',
  SignUp: '/signUp',
  Home: '/home',
  Studios: '/studios',
  Privacy: '/setting/privacy',
  Terms: '/setting/terms',
  Inquiry: '/setting/inquiry',
  Tickets: '/tickets',
  Maintenance: '/maintenance',
  Certification: '/certification',
  AccountSetting: '/setting/account',
  Pass: '/pass',
  SignOut: '/setting/account/signOut',
  PassPayment: (id: number) => `/pass/${id}/payment`,
  StudioLessons: (id: number) => `/studios/${id}/lessons`,
  StudioPassPaymentComplete: (id: number) => `/studios/${id}/passPaymentComplete`,
  LessonDetail: (id: number) => `/lessons/${id}`,
  LessonPayment: (id: number) => `/lessons/${id}/payment`,
  TicketDetail: (id: number, isJustPaid: boolean) => `/tickets/${id}?isJustPaid=${isJustPaid}`,
  StudioDetail: (id: number) => `/studios/${id}`,
} as const;