export const KloudScreen = {
  Splash: '/splash',
  Main: '/main',
  Onboard: (returnUrl: string) => `/onboarding?returnUrl=${returnUrl}`,
  Login: (query: string) => `/login${query}`,
  LoginEmail: (query: string) => `/login/email${query}`,
  LoginDeactivate: '/login/deactivate',
  SignUp: (query: string) => `/signUp${query}`,
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
  Certification: (isFromPayment: boolean) => `/certification?isFromPayment=${isFromPayment}`,
  ProfileSetting: '/profile/setting',
  ProfileEdit: '/profile/profileEdit',
  RefundAccountSetting: '/profile/setting/refund',
  MyAccount: '/profile/setting/account',
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
  MyPass: '/profile/myPass',
  MySubscription: '/profile/mySubscription',
  MyPassDetail: (id: number) => `/profile/myPass/${id}`,
  MySubscriptionDetail: (id: string) => `/profile/mySubscription/${id}`,
  SignOut: '/profile/setting/signOut',
  LanguageSetting: '/profile/setting/language',
  PaymentMethodSetting: '/profile/setting/paymentMethod',
  PaymentMethodAddSheet : '/profile/setting/paymentMethod/sheet',
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
  StudioSettingSheet: '/studios/setting/sheet'
} as const;

export const isAuthScreen = (endpoint: string) => {
  return (endpoint.includes('/lessons/') && endpoint.includes('/payment'));
}

export const NO_DATA_ID = -1