export const KloudScreen = {
  Splash: '/splash',
  Main: '/main',
  Onboard: (returnUrl: string) => `/onboarding?returnUrl=${returnUrl}`,
  Login: (returnUrl: string) => `/login?returnUrl=${returnUrl}`,
  LoginEmail: (returnUrl: string) => `/login/email?returnUrl=${returnUrl}`,
  LoginDeactivate: '/login/deactivate',
  SignUp: (returnUrl: string) => `/signUp?returnUrl=${returnUrl}`,
  Home: '/home',
  Notification: '/notifications',
  Studios: '/studios',
  Privacy: '/setting/privacy',
  Terms: '/setting/terms',
  Inquiry: '/setting/inquiry',
  Tickets: '/tickets',
  PaymentRecords: '/paymentRecords',
  Maintenance: '/maintenance',
  Certification: '/certification',
  AccountSetting: '/setting/account',
  ProfileEdit: '/setting/account/refund',
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
  MyPass: '/setting/myPass',
  PassPlanSheet: (id: number) => `/studios/${id}/passPlans`,
  MyPassDetail: (id: number) => `/setting/myPass/${id}`,
  SignOut: '/setting/account/signOut',
  LanguageSetting: '/setting/account/language',
  DeveloperSetting: '/setting/account/developer',
  DeveloperAuthentication: '/setting/account/developer/authentication',
  PassPayment: (id: number) => `/passPlans/${id}/payment`,
  StudioLessons: (id: number) => `/studios/${id}/lessons`,
  PassPaymentComplete: (id: number) => `/passPlans/${id}/paymentComplete`,
  LessonDetail: (id: number) => `/lessons/${id}`,
  LessonPayment: (id: number) => `/lessons/${id}/payment`,
  TicketDetail: (id: number, isJustPaid: boolean) => `/tickets/${id}?isJustPaid=${isJustPaid}`,
  StudioDetail: (id: number) => `/studios/${id}`,

  LanguageSettingSheet: '/setting/account/language/sheet',
  StudioSettingSheet: '/studios/setting/sheet'
} as const;

export const isAuthScreen = (endpoint: string) => {
  return (endpoint.includes('/lessons/') && endpoint.includes('/payment'));
}

export const NO_DATA_ID = -1