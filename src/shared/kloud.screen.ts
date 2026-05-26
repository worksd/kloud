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
  RefundAccountSetting: '/profile/setting/account/refund',
  PaymentMethodSetting: '/profile/setting/account/paymentMethod',
  InstagramConnect: '/profile/setting/account/instagram',
  LanguageSetting: '/profile/setting/language',
  LanguageSettingSheet: '/profile/setting/language/sheet',
  SignOut: '/profile/setting/account/signOut',
  DeveloperSetting: '/profile/setting/developer',
  DeveloperAuthentication: '/profile/setting/developer/authentication',
  BusinessInfo: '/profile/setting/businessInfo',
  Kiosk: '/kiosk',

  /** 결제 (Pass, Subscription, Records, Tickets) */
  Payment: (type: 'lesson' | 'pass-plan' | 'lesson-group', id: number) => `/payment?type=${type}&id=${id}`,
  PurchasePass: (studioId: number) => `/passPlans?studioId=${studioId}`,
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

  /** 공지 */
  AnnouncementList: (studioId: number) => `/announcements?studioId=${studioId}`,
  AnnouncementDetail: (id: number) => `/announcements/${id}`,

  /** 레슨 */
  LessonDetail: (id: number) => `/lessons/${id}`,

  /** 정기수업 */
  LessonGroupDetail: (id: number) => `/lesson-groups/${id}`,
  LessonGroupTickets: '/lesson-group-tickets',
  LessonGroupTicketDetail: (id: number, isParent: boolean) => `/lesson-group-tickets/${id}?isParent=${isParent}`,

  /** 연습실 */
  StudioRoomDetail: (id: number, date?: string) => date ? `/studioRooms/${id}?date=${date}` : `/studioRooms/${id}`,

  /** 스튜디오 */
  Studios: '/studios',
  StudioDetail: (id: number) => `/studios/${id}`,
  StudioLessons: (id: number) => `/studios/${id}/lessons`,
  StudioSettingSheet: '/studios/setting/sheet',
  StudioSetting: '/profile/setting/studio',

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
  return endpoint.includes('/payment') && !endpoint.startsWith('/login');
}

export const NO_DATA_ID = -1