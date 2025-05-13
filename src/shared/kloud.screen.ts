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
  Policy: '/profile/policy',
  Privacy: '/profile/policy/privacy',
  Terms: '/profile/policy/terms',
  BusinessInfo: '/profile/setting/businessInfo',
  Inquiry: '/profile/inquiry',
  Tickets: '/tickets',
  PaymentRecords: '/paymentRecords',
  Maintenance: '/maintenance',
  Certification: '/certification',
  ProfileSetting: '/profile/setting',
  ProfileEdit: '/profile/setting/refund',
  MyAccount: '/profile/setting/account',
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
  MyPass: '/profile/myPass',
  MyPassDetail: (id: number) => `/setting/myPass/${id}`,
  SignOut: '/profile/setting/signOut',
  LanguageSetting: '/profile/setting/language',
  PasswordSetting: '/profile/setting/account/resetPassword',
  DeveloperSetting: '/profile/setting/developer',
  DeveloperAuthentication: '/profile/setting/developer/authentication',
  PassPayment: (id: number) => `/passPlans/${id}/payment`,
  StudioLessons: (id: number) => `/studios/${id}/lessons`,
  PassPaymentComplete: (id: number) => `/passPlans/${id}/paymentComplete`,
  LessonDetail: (id: number) => `/lessons/${id}`,
  LessonPayment: (id: number) => `/lessons/${id}/payment`,
  TicketDetail: (id: number, isJustPaid: boolean) => `/tickets/${id}?isJustPaid=${isJustPaid}`,
  StudioDetail: (id: number) => `/studios/${id}`,

  LanguageSettingSheet: '/profile/setting/language/sheet',
  StudioSettingSheet: '/studios/profile/sheet'
} as const;

export const isAuthScreen = (endpoint: string) => {
  return (endpoint.includes('/lessons/') && endpoint.includes('/payment'));
}

export const NO_DATA_ID = -1