export const KloudScreen = {
  /** 공통 */
  Splash: '/splash',
  Main: '/main',
  Maintenance: '/maintenance',

  /** 온보딩 / 인증 */
  Onboard: '/onboarding',
  Login: (query: string) => `/login${query}`,
  LoginIntro: (query: string) => `/login/intro${query}`,
  LoginEmail: (query: string) => `/login/email${query}`,
  LoginPhone: (query: string) => `/login/phone${query}`,
  LoginDeactivate: '/login/deactivate',
  SignUp: (query: string) => `/signUp${query}`,
  Certification: `/certification`,

  /** 프로필 관련 */
  Profile: '/profile',
  ProfileSetting: '/profile/setting',
  ProfileEdit: '/profile/profileEdit',
  MyAccount: '/profile/setting/account',
  PasswordSetting: '/profile/setting/account/resetPassword',
  RefundAccountSetting: '/profile/setting/account/refund',
  PaymentMethodSetting: '/profile/setting/account/paymentMethod',
  InstagramConnect: '/profile/setting/account/instagram',
  SnsConnect: '/profile/setting/account/sns',
  LanguageSetting: '/profile/setting/language',
  LanguageSettingSheet: '/profile/setting/language/sheet',
  NotificationSetting: '/profile/setting/notification',
  CouponRegister: '/profile/setting/coupon',
  SignOut: '/profile/setting/account/signOut',
  DeveloperSetting: '/profile/setting/developer',
  DeveloperAuthentication: '/profile/setting/developer/authentication',
  BusinessInfo: '/profile/setting/businessInfo',
  Kiosk: '/kiosk',

  /** 결제 (Pass, Subscription, Records, Tickets) */
  Payment: (type: 'lesson' | 'pass-plan' | 'bundle', id: number) => `/payment?type=${type}&id=${id}`,
  /** 이용권(패스) 결제 — item 방식 */
  PassPlanPayment: (id: number) => `/payment?item=pass-plan&id=${id}`,
  /** 연습실 결제 — item 방식 + 예약 시간대(startTime/endTime, 'YYYY-MM-DDTHH:mm') */
  PracticeRoomPayment: (roomId: number, startTime: string, endTime: string) =>
    `/payment?item=practice-room&id=${roomId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  BundlePayment: (id: number) => `/bundle/${id}/payment`,
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

  /** 개인수업 (강사) */
  PrivateLessonCreate: '/privateLessons/create',
  PrivateLessonInvite: (lessonId: number, studioId: number) => `/privateLessons/${lessonId}/invite?studioId=${studioId}`,
  /** 강사가 진행한 수업 목록 */
  ArtistLessons: '/artistLessons',

  /** 내 스튜디오 (PC 웹) */
  MyStudio: '/myStudio',
  Search: (keyword: string) => `/search?q=${encodeURIComponent(keyword)}`,
  // 관리자(Partner/Operator) 전용 랜딩 — 바텀 내비 없는 풀스크린으로 진입
  AdminHome: '/admin',

  /** 연습실 */
  StudioRoomDetail: (id: number, date?: string) => date ? `/studioRooms/${id}?date=${date}` : `/studioRooms/${id}`,
  /** 대관 예약 내역/상세 */
  RoomBookings: '/roomBookings',
  RoomBookingDetail: (id: number) => `/roomBookings/${id}`,

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
  MarketingAgreement: '/profile/policy/marketing',
  Inquiry: '/profile/inquiry',
  Notification: '/notifications',

  /** 아티스트 */
  ArtistDetail: (id: number) => `/artists/${id}`,

  /** QR 스캔 */
  QRScan: '/qrs',
  QRScanWithLesson: (lessonId: number) => `/qrs?lessonId=${lessonId}`,
} as const;


// 결제 페이지(/payment)는 비로그인 진입 허용이라 목록에 넣지 않는다 (폰 인증으로 payer 확보).
// 비로그인 웹 접근 시 로그인(/login/intro)으로 보낼 경로 프리픽스.
// proxy가 웹(appVersion == '') + accessToken 쿠키 없음일 때만 검사한다 — 앱 웹뷰는 네이티브가 세션을 보장.
// 여기 없던 시절엔 각 페이지가 me 조회 실패 후 null을 반환해 빈 화면이 났다.
const AUTH_SCREEN_PREFIXES = [
  '/profile',
  '/tickets',
  '/paymentRecords',
  '/roomBookings',
  '/qrs',
  '/privateLessons',
  '/artistLessons',
  '/notifications',
  '/onboarding',
];
// 약관·개인정보처리방침은 비로그인 열람 가능해야 한다 (스토어 심사 요건)
const PUBLIC_EXCEPTIONS = ['/profile/policy'];

export const isAuthScreen = (endpoint: string) => {
  if (PUBLIC_EXCEPTIONS.some((p) => endpoint === p || endpoint.startsWith(p + '/'))) return false;
  return AUTH_SCREEN_PREFIXES.some((p) => endpoint === p || endpoint.startsWith(p + '/'));
}

export const NO_DATA_ID = -1