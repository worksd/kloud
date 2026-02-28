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
  QRScanner: '/profile/setting/qr-scanner',

  /** 결제 (Pass, Subscription, Records, Tickets) */
  Payment: (type: 'lesson' | 'pass-plan' | 'lesson-group' | 'membership-plan', id: number) => `/payment?type=${type}&id=${id}`,
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
  MembershipPlans: (studioId?: number) => studioId ? `/membershipPlans?studioId=${studioId}` : '/membershipPlans',
  MembershipPlanPayment: (id: number) => `/membershipPlans/${id}/payment`,
  MembershipDetail: (id: number) => `/memberships/${id}`,
  MyPass: '/profile/myPass',
  MyPassDetail: (id: number) => `/profile/myPass/${id}`,
  MySubscription: '/profile/mySubscription',
  MySubscriptionDetail: (id: string) => `/profile/mySubscription/${id}`,
  MySubscriptionCancel: (id: string) => `/profile/mySubscription/${id}/cancel`,
  Tickets: '/tickets',
  TicketDetail: (id: number, isParent: boolean) => `/tickets/${id}?isParent=${isParent}`,
  PaymentRecords: '/paymentRecords',
  PaymentRecordDetail: (paymentId: string) => `/paymentRecords/${paymentId}`,
  PaymentRecordRefund: (paymentId: string) => `/paymentRecords/${paymentId}/refund`,

  /** 레슨 */
  LessonDetail: (id: number) => `/lessons/${id}`,

  /** 정기수업 */
  LessonGroupDetail: (id: number) => `/lesson-groups/${id}`,
  LessonGroupTickets: '/lesson-group-tickets',
  LessonGroupTicketDetail: (id: number, isParent: boolean) => `/lesson-group-tickets/${id}?isParent=${isParent}`,

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

  /** QR 스캔 */
  QRScan: '/qrs',
  QRScanWithLesson: (lessonId: number) => `/qrs?lessonId=${lessonId}`,
} as const;


export const isAuthScreen = (endpoint: string) => {
  return endpoint.includes('/payment');
}

export const NO_DATA_ID = -1