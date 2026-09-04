import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/app/api.client';
import { UserType } from '@/entities/user/user.type';
import { LessonStatus } from '@/app/endpoint/lesson.endpoint';
import { getLessonsByDate } from '@/app/kiosk/get.lessons.by.date.action';
import { TimeTableServerComponent } from '@/app/home/TimeTableServerComponent';
import { TodayTimetable, TimetableLesson } from '@/app/home/TodayTimetable';
import { ChevronRight } from 'lucide-react';
import { CircleImage } from '@/app/components/CircleImage';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';
import { getLocale, translate } from '@/utils/translate';
import { accessTokenKey } from '@/shared/cookies.key';
import { AdminShortcuts, AdminSheetLesson } from '@/app/admin/AdminShortcuts';
import { AdminModeNotice } from '@/app/admin/AdminModeNotice';
import { formatLessonTimeRange } from '@/app/kiosk/kiosk.lesson';

// 관리자(Partner/Operator) 전용 홈 — 스플래시가 GET /auth의 user.type을 보고
// 메인(바텀 탭) 대신 clearAndPush로 이 화면에 풀스크린 랜딩시킨다. ignoreSafeArea 라우트.
// 구성: 학원 헤더 + 숏컷(오늘 수업 출석 체크 등) + 오늘 수업 타임라인 + 주간 시간표.
// 출석 체크 자체는 수업 상세(수강생 바텀시트의 '출석하기')에서 — 오늘 수업 row 탭 → 수업 상세로 이동.

// Vercel 서버는 UTC — '오늘'은 KST 기준으로 계산해야 새벽에 어제 수업이 뜨지 않는다.
const todayKst = (): string => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${kst.getUTCFullYear()}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())}`;
};

export default async function AdminHomePage() {
  // 가드 — 토큰 검사(GET /auth)의 user.type. 관리자가 아니면(비로그인 포함) 일반 홈으로.
  const auth = await api.auth.token({});
  const isAdminUser = 'id' in auth && (auth.type === UserType.Partner || auth.type === UserType.Operator);
  if (!isAdminUser) redirect('/home');

  const me = await api.user.me({});
  const studio = 'id' in me ? me.studio : undefined;

  if (!studio?.id) {
    return (
      <div className={'w-full min-h-screen bg-white flex items-center justify-center px-8'} style={{ paddingTop: 'env(safe-area-inset-top, 44px)' }}>
        <p className={'text-[15px] text-[#6B7280] text-center whitespace-pre-line'}>{await translate('admin_home_no_studio')}</p>
      </div>
    );
  }

  const locale = await getLocale();
  const res = await getLessonsByDate(studio.id, todayKst());
  const lessons = 'lessons' in res ? res.lessons.filter((l) => l.status !== LessonStatus.Cancelled) : [];
  const todayLessons: TimetableLesson[] = lessons.map((l) => ({
    id: l.id,
    title: l.title ?? '-',
    thumbnailUrl: l.thumbnailUrl,
    startDate: l.startDate,
    duration: l.duration,
    roomName: l.room?.name,
    artists: l.artists?.map((a) => ({ nickName: a.nickName, name: a.name })),
  }));

  // 출석 체크 바텀시트용 — 썸네일 + 제목 + 시간/강사·룸 라벨을 서버에서 미리 포맷
  const sheetLessons: AdminSheetLesson[] = lessons.map((l) => ({
    id: l.id,
    title: l.title ?? '-',
    thumbnailUrl: l.thumbnailUrl,
    timeLabel: formatLessonTimeRange(l, locale) || undefined,
    subLabel: [l.artists?.[0]?.nickName, l.room?.name].filter(Boolean).join(' · ') || undefined,
  }));

  const adminName = ('id' in me ? (me.name || me.nickName) : undefined) ?? '';
  // 키오스크 로그인 QR용 — 현재 관리자 토큰. 키오스크가 /kiosk?token=으로 열면 그대로 로그인된다.
  const accessToken = (await cookies()).get(accessTokenKey)?.value ?? '';

  return (
    // ignoreSafeArea 풀스크린 — 상태바 영역은 safe-area 패딩으로 직접 확보 (env 미지원 웹뷰 폴백 44px)
    <div className={'w-full min-h-screen bg-white flex flex-col pb-32'} style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)' }}>
      {/* 관리자 모드 안내 + 일반 모드 전환 */}
      <AdminModeNotice
        notice={await translate('admin_home_mode_notice')}
        goUserMode={await translate('admin_home_go_user_mode')}
      />

      {/* 헤더 — 스튜디오 칩 버튼(탭 → 스튜디오 페이지) */}
      <div className={'flex items-center px-5 pt-4 pb-4'}>
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
        <p className={'px-5 pb-4 text-[22px] font-bold text-black tracking-[-0.4px]'}>
          {(await translate('admin_home_greeting')).replace('{name}', adminName)}
        </p>
      )}

      {/* 숏컷(출석 체크·결제 내역·수강생 등록) + 바텀시트들 */}
      <AdminShortcuts lessons={sheetLessons} locale={locale} kioskToken={accessToken}/>

      {/* 오늘 수업 — row 탭 → 수업 상세(수강생 바텀시트에서 출석하기) */}
      <div id={'today'} className={'scroll-mt-4'}>
        {todayLessons.length > 0 ? (
          <TodayTimetable
            title={await translate('admin_home_today_title')}
            lessons={todayLessons}
            endedLabel={await translate('finish')}
            ongoingLabel={await translate('in_progress')}
          />
        ) : (
          <div className={'px-5 py-10 text-center text-[14px] text-[#8B95A1]'}>
            {await translate('kiosk_lesson_attendance_no_lessons')}
          </div>
        )}
      </div>

      {/* 주간 시간표 */}
      <div id={'timetable'} className={'scroll-mt-4'}>
        <TimeTableServerComponent studioId={studio.id} clickEvent={'click_band_timetable'}/>
      </div>
    </div>
  );
}
