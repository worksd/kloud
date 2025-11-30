export const KloudScreen = {
  /** 공통 */
  Splash: '/splash',
  Main: '/main',
  Maintenance: '/maintenance',

  /** 온보딩 / 인증 */
  Onboard: (returnUrl: string) => `/onboarding?returnUrl=${returnUrl}`,
  Login: (query: string) => `/login${query}`,
  LoginIntro: (query: string) => `/login/intro${query}`,
  LoginEmail: (query: string) => `/login/email${query}`,
  LoginPhone: (query: string) => `/login/phone${query}`,
  LoginDeactivate: '/login/deactivate',
  SignUp: (query: string) => `/signUp${query}`,
  Certification: `/certification`,

  /** 프로필 관련 */
  ProfileSetting: '/profile/setting',
  ProfileEdit: '/profile/profileEdit',
  MyAccount: '/profile/setting/account',
  PasswordSetting: '/profile/setting/account/resetPassword',
  RefundAccountSetting: '/profile/setting/refund',
  PaymentMethodSetting: '/profile/setting/paymentMethod',
  LanguageSetting: '/profile/setting/language',
  LanguageSettingSheet: '/profile/setting/language/sheet',
  SignOut: '/profile/setting/signOut',
  DeveloperSetting: '/profile/setting/developer',
  DeveloperAuthentication: '/profile/setting/developer/authentication',
  BusinessInfo: '/profile/setting/businessInfo',
  Kiosk: '/profile/setting/kiosk',

  /** 결제 (Pass, Subscription, Records, Tickets) */
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
  PassPayment: (id: number) => `/passPlans/${id}/payment`,
  MyPass: '/profile/myPass',
  MyPassDetail: (id: number) => `/profile/myPass/${id}`,
  MySubscription: '/profile/mySubscription',
  MySubscriptionDetail: (id: string) => `/profile/mySubscription/${id}`,
  MySubscriptionCancel: (id: string) => `/profile/mySubscription/${id}/cancel`,
  Tickets: '/tickets',
  TicketDetail: (id: number, isParent: boolean) => `/tickets/${id}?isParent=${isParent}`,
  PaymentRecords: '/paymentRecords',
  PaymentRecordDetail: (paymentId: string) => `/paymentRecords/${paymentId}`,

  /** 레슨 */
  LessonDetail: (id: number) => `/lessons/${id}`,
  LessonPayment: (id: number) => `/lessons/${id}/payment`,

  /** 스튜디오 */
  Studios: '/studios',
  StudioDetail: (id: number) => `/studios/${id}`,
  StudioLessons: (id: number) => `/studios/${id}/lessons`,
  StudioSettingSheet: '/studios/setting/sheet',
  HasPassStudioList: `/studios/passPlans`,

  /** 정책 / 문의 / 알림 */
  Policy: '/profile/policy',
  Privacy: '/profile/policy/privacy',
  Terms: '/profile/policy/terms',
  Inquiry: '/profile/inquiry',
  Notification: '/notifications',

  /** 아티스트 */
  ArtistDetail: (id: number) => `/artists/${id}`,
} as const;


export const isAuthScreen = (endpoint: string) => {
  return (endpoint.includes('/lessons/') && endpoint.includes('/payment'));
}

export const NO_DATA_ID = -1