import React from 'react';
import { cookies } from 'next/headers';
import { api } from '@/app/api.client';
import { TimeTableServerComponent } from '@/app/home/TimeTableServerComponent';
import { ChevronRight } from 'lucide-react';
import { CircleImage } from '@/app/components/CircleImage';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';
import { getLocale, translate } from '@/utils/translate';
import { accessTokenKey } from '@/shared/cookies.key';
import { AdminShortcuts } from '@/app/admin/AdminShortcuts';
import { getTodayAdminLessons } from '@/app/admin/admin.today.lessons';
import { ADMIN_CONTENT_TOP_PAD, ADMIN_HEADER_TOP_PAD } from '@/app/admin/admin.layout';
import { AdminNoHorizontalScroll } from '@/app/admin/AdminNoHorizontalScroll';

/**
 * 관리자(Partner/Operator) 홈 본문.
 *
 * 바텀 탭의 첫 탭은 일반 유저와 같은 '/home'을 쓰고, 그 페이지가 관리자일 때 이 폼으로 갈아끼운다
 * (앱 수정 없이 관리자 홈을 첫 탭에 태우기 위함 — /admin 을 첫 탭 route 로 주면 부팅 시 흰 화면).
 * /admin 경로로 직접 들어와도 같은 화면이 뜨도록 그쪽에서도 이 컴포넌트를 쓴다.
 *
 * 호출 측에서 관리자 여부를 이미 검증했다고 보고, 여기서는 학원 정보만 확인한다.
 */
export async function AdminHomeForm() {
  const me = await api.user.me({});
  const studio = 'id' in me ? me.studio : undefined;

  if (!studio?.id) {
    return (
      <div className={'w-full min-h-screen overflow-x-clip bg-white flex items-center justify-center px-8'} style={{ paddingTop: ADMIN_CONTENT_TOP_PAD }}>
        <p className={'text-[15px] text-[#6B7280] text-center whitespace-pre-line'}>{await translate('admin_home_no_studio')}</p>
      </div>
    );
  }

  const locale = await getLocale();
  // 출석 체크 다이얼로그용 오늘 수업 — 현장결제 페이지와 같은 로더
  const sheetLessons = await getTodayAdminLessons(studio.id, locale);

  const adminName = ('id' in me ? (me.name || me.nickName) : undefined) ?? '';
  // 키오스크 로그인 QR용 — 현재 관리자 토큰. 키오스크가 /kiosk?token=으로 열면 그대로 로그인된다.
  const accessToken = (await cookies()).get(accessTokenKey)?.value ?? '';

  return (
    // ignoreSafeArea 풀스크린 — 상태바 영역은 safe-area 패딩으로 직접 확보 (env 미지원 웹뷰 폴백 44px)
    // 가로 스크롤 차단은 AdminNoHorizontalScroll(html overflow-x) — 루트에 overflow-x-hidden을 주면 sticky 헤더가 고정되지 않는다
    <div className={'w-full min-h-screen overflow-x-clip bg-[#F7F8FA] flex flex-col pb-32'}>
      <AdminNoHorizontalScroll/>
      {/* 고정 헤더 — 다른 관리자 탭(AdminPageHeader)과 같은 구조. 스튜디오 칩만 상단에 붙고 본문만 스크롤된다. */}
      <div
        className={'sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#EDEFF2] px-5 pb-3'}
        style={{ paddingTop: ADMIN_HEADER_TOP_PAD }}
      >
        <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(studio.id)}>
          <div className={'inline-flex items-center gap-2.5 rounded-full bg-[#F7F8F9] pl-2 pr-3 py-2 cursor-pointer active:bg-[#F1F3F6] transition-colors'}>
            <CircleImage imageUrl={studio.profileImageUrl} size={32}/>
            <div className={'flex flex-col'}>
              <span className={'text-[15px] font-bold text-black leading-tight'}>{studio.name}</span>
              <span className={'text-[11px] text-[#8B95A1] leading-tight'}>{await translate('admin_home_title')}</span>
            </div>
            <ChevronRight size={18} className={'text-[#B1B8BE]'}/>
          </div>
        </NavigateClickWrapper>
      </div>

      {/* 인사말 */}
      {adminName && (
        <p className={'px-5 pt-5 pb-1 text-[22px] font-bold text-[#191F28] tracking-[-0.4px]'}>
          {(await translate('admin_home_greeting')).replace('{name}', adminName)}
        </p>
      )}

      {/* 숏컷(출석 체크·현장결제·키오스크 로그인) — 흰 카드. 결제 내역은 '매출' 탭, 수강생 등록은 '수강생' 탭으로 옮겼다 */}
      <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] px-1 py-3'}>
        <AdminShortcuts lessons={sheetLessons} locale={locale} kioskToken={accessToken}/>
      </section>

      {/* 주간 시간표 */}
      <section id={'timetable'} className={'mx-4 mt-3 scroll-mt-4 rounded-2xl bg-white border border-[#EEF0F2] overflow-hidden'}>
        <TimeTableServerComponent studioId={studio.id} clickEvent={'click_band_timetable'} noMargin/>
      </section>
    </div>
  );
}
