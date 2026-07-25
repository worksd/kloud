'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {KioskTopBar} from '@/app/kiosk/KioskTopBar';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import {createStudioAttendanceAction, listStudioAttendancesAction, searchUserAction} from "@/app/kiosk/kiosk.actions";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {GetUserResponse} from "@/app/endpoint/user.endpoint";
import {AttendanceStatus, StudioAttendanceItem} from "@/app/endpoint/studio.endpoint";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {kioskImageSrc} from "@/app/kiosk/kiosk.image";
import {toAmPm} from "@/app/kiosk/kiosk.lesson";

type Step = 'phone' | 'select' | 'detail';

const LOCALE_TAG: Record<Locale, string> = {ko: 'ko-KR', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN'};
const WEEKDAYS: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// 서버 createdAt(ISO 또는 'yyyy.MM.dd HH:mm') → '7월 25일 (금) 오후 3:47' 라벨. 파싱 실패 시 단말 현재 시각.
const toLocalDateTimeLabel = (raw: string | undefined, locale: Locale): string => {
  const parsed = raw ? new Date(raw.replace(/\./g, '-').replace(' ', 'T')) : null;
  const d = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
  const date = new Intl.DateTimeFormat(LOCALE_TAG[locale], {month: 'long', day: 'numeric'}).format(d);
  const weekday = WEEKDAYS[locale][d.getDay()];
  return `${date} (${weekday}) ${toAmPm(`${pad(d.getHours())}:${pad(d.getMinutes())}`, locale)}`;
};
const monthRange = (d: Date) => ({
  startDate: ymd(new Date(d.getFullYear(), d.getMonth(), 1)),
  endDate: ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
});

type KioskAttendanceFormProps = {
  /** 완료 다이얼로그에 노출할 스튜디오 로고/이름 */
  studioName: string;
  studioImageUrl?: string;
  onBack: () => void;
  onHome: () => void;
  onComplete: () => void;
  locale: Locale;
  /** 'admin'(상담실)이면 자동 홈복귀 미동작 */
  variant?: 'kiosk' | 'admin';
};

export const KioskAttendanceForm = ({studioName, studioImageUrl, onBack, onHome, locale, variant = 'kiosk'}: KioskAttendanceFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const admin = variant === 'admin';

  const [step, setStep] = useState<Step>('phone');
  const [user, setUser] = useState<GetUserResponse | null>(null);
  const [searchResults, setSearchResults] = useState<GetUserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 유저 검색 중

  // 출결
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [attendances, setAttendances] = useState<StudioAttendanceItem[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // 체크인/아웃 완료 다이얼로그. 닫으면(확인·바깥 탭) 홈으로 복귀한다.
  // message=완료 문구, kind=체크인/체크아웃, time=처리 시각(오전/오후 표기)
  const [done, setDone] = useState<{ message: string; kind: 'in' | 'out'; time: string } | null>(null);
  // 오늘 출석 기록 — 뷰 월과 무관하게 별도 조회로 관리(달력 이동해도 안 틀어지도록).
  // null=미출석, checkOutTime 있으면 오늘 할 동작이 없음(체크인·체크아웃 모두 완료)
  const [todayRecord, setTodayRecord] = useState<StudioAttendanceItem | null>(null);
  // studioAttendances 첫 응답이 오기 전엔 달력/CTA를 그리지 않는다 —
  // 빈 달력이 먼저 뜨거나 체크인/체크아웃 버튼 라벨이 뒤늦게 뒤바뀌는 걸 막기 위함.
  const [detailReady, setDetailReady] = useState(false);

  const todayStr = ymd(new Date());

  // 무인 키오스크만 무입력 시 자동 홈복귀
  const [countdown, setCountdown] = useState(180);
  useEffect(() => {
    if (admin) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); onBack(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack, admin]);

  const fetchAttendances = useCallback(async (uid: number, month: Date) => {
    setAttLoading(true);
    const {startDate, endDate} = monthRange(month);
    try {
      const res = await listStudioAttendancesAction({targetUserId: uid, startDate, endDate});
      setAttendances(!isGuinnessErrorCase(res) ? (res.attendances ?? []) : []);
    } catch {
      setAttendances([]);
    } finally {
      setAttLoading(false);
    }
  }, []);

  // 오늘 출석 여부 갱신 — 이번 달 전체(1일~말일)를 조회하고 그 안에 오늘 날짜가 있는지로 판단.
  // (뷰 월과 무관하게 항상 '이번 달'을 조회하므로 달력을 다른 달로 넘겨도 안 틀어짐)
  const refreshToday = useCallback(async (uid: number) => {
    const {startDate, endDate} = monthRange(new Date());
    try {
      const res = await listStudioAttendancesAction({targetUserId: uid, startDate, endDate});
      const today = !isGuinnessErrorCase(res) ? (res.attendances ?? []).find((a) => a.date === todayStr) : undefined;
      setTodayRecord(today ?? null);
    } catch {
      setTodayRecord(null);
    }
  }, [todayStr]);

  const selectUser = (u: GetUserResponse) => {
    setUser(u);
    setError(null);
    const now = new Date();
    setViewMonth(now);
    setStep('detail');
    // 두 조회가 모두 끝난 뒤에 상세 UI를 그린다 (달력 기록 + 오늘 출석 여부가 함께 확정되도록)
    setDetailReady(false);
    Promise.all([fetchAttendances(u.id, now), refreshToday(u.id)])
      .finally(() => setDetailReady(true));
  };

  const searchUser = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchUserAction(value);
      // 0명 → 없다고 안내(신규 가입 없음) / 1명 → 바로 진행 / 2명+ → 선택 목록
      if (isGuinnessErrorCase(result) || result.users.length === 0) {
        setError(t('kiosk_no_member_found'));
      } else if (result.users.length === 1) {
        selectUser(result.users[0]);
      } else {
        setSearchResults(result.users);
        setStep('select');
      }
    } catch {
      setError(t('kiosk_search_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 오늘 기록 없으면 체크인, 체크인만 있으면 체크아웃. 둘 다 끝났으면 할 동작이 없다.
  const allDoneToday = !!todayRecord?.checkOutTime;
  const nextStatus: AttendanceStatus = todayRecord ? 'CheckOut' : 'CheckIn';

  const submitAttendance = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);
    const label = nextStatus === 'CheckIn' ? t('kiosk_check_in') : t('kiosk_check_out');
    try {
      const res = await createStudioAttendanceAction(user.id, nextStatus);
      if (isGuinnessErrorCase(res)) {
        setError(t('kiosk_attendance_failed').replace('{0}', label));
      } else {
        // 완료 다이얼로그 — 확인/바깥 탭으로 닫으면 홈으로 복귀하므로 목록 갱신은 하지 않는다.
        // 시각은 서버 응답 createdAt 우선, 파싱 실패 시 단말 현재 시각.
        setDone({
          message: nextStatus === 'CheckIn' ? t('kiosk_check_in_complete') : t('kiosk_check_out_complete'),
          kind: nextStatus === 'CheckIn' ? 'in' : 'out',
          time: toLocalDateTimeLabel((res as { createdAt?: string }).createdAt, locale),
        });
      }
    } catch {
      setError(t('kiosk_attendance_failed').replace('{0}', label));
    } finally {
      setSubmitting(false);
    }
  };

  // ── 전화/이메일 입력 (결제·수업출석과 동일 KioskPhoneInputForm) ──
  if (step === 'phone') {
    return (
      <KioskPhoneInputForm
        locale={locale}
        variant={variant}
        mode="lastFour"
        onBack={onBack}
        onHome={onHome}
        onNext={(value) => searchUser(value)}
        onSearchByEmail={(value) => searchUser(value)}
        loading={loading}
        errorMessage={error}
        onDismissError={() => setError(null)}
      />
    );
  }

  // ── 동명이인 선택 ──
  if (step === 'select') {
    return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col animate-[fadeIn_260ms_ease-out]">
        <KioskTopBar title={t('kiosk_attendance')} onBack={() => { setSearchResults([]); setError(null); setStep('phone'); }} onHome={onHome} />
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          <p className="text-black text-[32px] font-bold mb-[8px] w-full max-w-[520px] text-center">{t('kiosk_select_user_title')}</p>
          <p className="text-gray-400 text-[20px] mb-[28px] w-full max-w-[520px] text-center">{t('kiosk_select_user_desc')}</p>
          <div className="w-full max-w-[520px] flex flex-col gap-[12px] overflow-y-auto max-h-[52vh]">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUser(u)}
                className="w-full bg-gray-50 rounded-[16px] p-[20px] flex items-center gap-[16px] active:bg-gray-200 transition-colors"
              >
                <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {u.profileImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kioskImageSrc(u.profileImageUrl, 140)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col items-start gap-[4px]">
                  <p className="text-black text-[20px] font-bold">{u.name || u.nickName || '-'}</p>
                  {u.phone && <p className="text-gray-500 text-[16px]">{u.phone}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── 출결 상세 — 월 달력 뷰. 각 날짜 칸에 체크인~체크아웃 기록을 직접 표시 ──
  const vy = viewMonth.getFullYear();
  const vm = viewMonth.getMonth();
  const lastDate = new Date(vy, vm + 1, 0).getDate();
  const leadBlanks = new Date(vy, vm, 1).getDay(); // 0=일
  // 격자를 빈 칸 없이 채운다 — 앞은 이전 달 말일들, 뒤는 다음 달 초일들을 dim 처리해서 함께 그린다.
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = leadBlanks; i > 0; i--) cells.push({date: new Date(vy, vm, 1 - i), inMonth: false});
  for (let d = 1; d <= lastDate; d++) cells.push({date: new Date(vy, vm, d), inMonth: true});
  for (let d = 1; cells.length % 7 !== 0; d++) cells.push({date: new Date(vy, vm + 1, d), inMonth: false});
  const recsByDate = new Map<string, StudioAttendanceItem[]>();
  attendances.forEach((a) => { const arr = recsByDate.get(a.date) ?? []; arr.push(a); recsByDate.set(a.date, arr); });
  const changeMonth = (delta: number) => {
    const next = new Date(vy, vm + delta, 1);
    setViewMonth(next);
    if (user) fetchAttendances(user.id, next);
  };

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col animate-[fadeIn_260ms_ease-out]">
      <KioskTopBar
        title={t('kiosk_attendance')}
        onBack={() => { setUser(null); setError(null); setStep(searchResults.length > 1 ? 'select' : 'phone'); }}
        onHome={onHome}
      />

      {/* studioAttendances 첫 응답 대기 — 이 동안엔 달력/CTA를 그리지 않는다 */}
      {!detailReady && (
        <div className="flex-1 flex flex-col items-center justify-center gap-[20px]">
          <div className="w-[52px] h-[52px] border-4 border-[#E8E8EA] border-t-[#1E2124] rounded-full animate-spin" />
          <p className="text-[#8B95A1] text-[18px]">{t('kiosk_loading')}</p>
        </div>
      )}

      {detailReady && (
      <div className="flex-1 min-h-0 flex flex-col px-[48px] pt-[4px] pb-[24px] animate-[fadeIn_240ms_ease-out]">
        {/* 헤더 — 회원 + 월 이동 */}
        <div className="shrink-0 flex items-center justify-between mb-[28px]">
          <div className="flex items-center gap-[14px] min-w-0">
            <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-gray-200 shrink-0">
              {user?.profileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kioskImageSrc(user.profileImageUrl, 140)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-black text-[22px] font-bold truncate">{user?.name || user?.nickName || '-'}</p>
              {user?.phone && <p className="text-gray-500 text-[15px]">{user.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-[16px]">
            <button onClick={() => changeMonth(-1)} className="w-[44px] h-[44px] rounded-full bg-[#F2F4F6] flex items-center justify-center active:scale-[0.94] transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-[40%] h-[40%]"><path d="M15 6L9 12L15 18" stroke="#1E2124" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="text-black text-[22px] font-bold" style={{minWidth: 160, textAlign: 'center'}}>
              {new Intl.DateTimeFormat(LOCALE_TAG[locale], {year: 'numeric', month: 'long'}).format(viewMonth)}
            </span>
            <button onClick={() => changeMonth(1)} className="w-[44px] h-[44px] rounded-full bg-[#F2F4F6] flex items-center justify-center active:scale-[0.94] transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-[40%] h-[40%]"><path d="M9 6L15 12L9 18" stroke="#1E2124" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="shrink-0 grid grid-cols-7 mb-[6px]">
          {WEEKDAYS[locale].map((w, i) => (
            <div key={w} className={`text-center text-[15px] font-bold ${i === 0 ? 'text-[#E0533F]' : 'text-[#8B95A1]'}`}>{w}</div>
          ))}
        </div>

        {/* 달력 그리드 — 각 칸에 체크인/체크아웃을 태그(pill)로 표시.
            월 이동 중에는 이전 달 기록을 흐리게 남겨두고 응답이 오면 fade로 교체한다. */}
        <div
          key={`${vy}-${vm}`}
          className={`flex-1 min-h-0 grid grid-cols-7 gap-[6px] animate-[fadeIn_240ms_ease-out] transition-opacity duration-200 ${attLoading ? 'opacity-40' : 'opacity-100'}`}
          style={{gridAutoRows: '1fr'}}
        >
          {cells.map(({date, inMonth}, idx) => {
            const dateStr = ymd(date);
            const recs = recsByDate.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            const dow = idx % 7;
            // 이전/다음 달 칸은 dim — 격자만 채우고 내용은 흐리게
            return (
              <div
                key={dateStr}
                className={`min-h-0 rounded-[12px] border p-[7px] flex flex-col overflow-hidden ${
                  isToday ? 'border-[#1E2124] bg-[#F7F8F9]' : 'border-[#EEF0F2]'
                } ${inMonth ? '' : 'opacity-40 bg-[#FAFBFC]'}`}
              >
                <span
                  className={`text-[14px] font-bold ${
                    !inMonth ? 'text-[#B1B8BE]' : isToday ? 'text-[#1E2124]' : dow === 0 ? 'text-[#E0533F]' : 'text-[#4E5968]'
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col items-start gap-[4px] mt-[4px]">
                  {recs.map((r) => (
                    <React.Fragment key={r.id}>
                      {r.checkInTime && <AttendanceTag kind="in" label={t('kiosk_tag_check_in')} time={toAmPm(r.checkInTime, locale)} />}
                      {/* 체크아웃 기록이 없으면 아무것도 안 붙인다 (미퇴실 같은 표기 X) */}
                      {r.checkOutTime && <AttendanceTag kind="out" label={t('kiosk_tag_check_out')} time={toAmPm(r.checkOutTime, locale)} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 에러 */}
        {error && <p className="shrink-0 mt-[12px] text-red-500 text-[16px] text-center">{error}</p>}

        {/* CTA — 오늘 체크인·체크아웃을 모두 마쳤으면 출석 버튼은 노출하지 않고 홈 복귀만 안내 */}
        {allDoneToday ? (
          <>
            <p className="shrink-0 mt-[16px] text-center text-[#8B95A1] text-[17px]">{t('kiosk_attendance_all_done')}</p>
            <button
              onClick={onHome}
              className="shrink-0 mt-[10px] w-full h-[76px] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center transition-transform active:scale-[0.98]"
            >
              <span className="text-[#1E2124] text-[24px] font-bold">{t('kiosk_go_home')}</span>
            </button>
          </>
        ) : (
          <button
            onClick={submitAttendance}
            disabled={submitting}
            className={`shrink-0 mt-[16px] w-full h-[76px] rounded-[16px] flex items-center justify-center transition-transform active:scale-[0.98] ${
              todayRecord ? 'bg-[#E0533F]' : 'bg-[#1E2124]'
            } ${submitting ? 'opacity-60' : ''}`}
          >
            {submitting ? (
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-white text-[24px] font-bold">
                {todayRecord ? t('kiosk_check_out_do') : t('kiosk_check_in_do')}
              </span>
            )}
          </button>
        )}
      </div>
      )}

      {/* 체크인/체크아웃 완료 — 누가·언제 처리됐는지 함께 보여주고, 확인 또는 바깥 탭으로 닫으면 홈으로 */}
      {done && (
        <div
          onClick={onHome}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] w-full max-w-[520px] px-[40px] pt-[32px] pb-[32px] flex flex-col items-center animate-[scaleIn_180ms_ease-out]"
          >
            {/* 스튜디오 로고 + 이름 */}
            <div className="flex items-center gap-[10px] mb-[24px] max-w-full">
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-[#F2F4F6] shrink-0">
                {studioImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={kioskImageSrc(studioImageUrl, 120)} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-[#4E5968] text-[19px] font-bold truncate">{studioName}</span>
            </div>

            {/* 체크 아이콘 */}
            <div className="w-[84px] h-[84px] rounded-full bg-[#EAF7F4] flex items-center justify-center mb-[24px]">
              <svg viewBox="0 0 24 24" fill="none" className="w-[44%] h-[44%]">
                <path d="M4 12.5L9.5 18L20 6.5" stroke="#1E9E8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-black text-[28px] font-bold text-center leading-snug">{done.message}</p>

            {/* 처리된 회원 + 시각 */}
            <div className="mt-[24px] w-full rounded-[18px] bg-[#F7F8F9] px-[22px] py-[20px] flex flex-col gap-[14px]">
              <div className="flex items-center gap-[14px] min-w-0">
                <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {user?.profileImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kioskImageSrc(user.profileImageUrl, 140)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-black text-[20px] font-bold truncate">{user?.name || user?.nickName || '-'}</p>
                  {user?.phone && <p className="text-[#8B95A1] text-[15px] truncate">{user.phone}</p>}
                </div>
              </div>
              <div className="h-px bg-[#E8EAED]" />
              <div className="flex items-center justify-between gap-[10px]">
                <AttendanceTag
                  kind={done.kind}
                  label={done.kind === 'in' ? t('kiosk_tag_check_in') : t('kiosk_tag_check_out')}
                />
                <span className="text-black text-[18px] font-bold text-right">{done.time}</span>
              </div>
            </div>

            <button
              onClick={onHome}
              className="mt-[28px] w-full h-[72px] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.98] transition-transform"
            >
              <span className="text-white text-[22px] font-bold">{t('kiosk_confirm')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 방문 기록 태그 — 시간 숫자만 나열하는 대신 '체크인 15:18' 형태의 pill로.
//  in  = 체크인(민트) / out = 체크아웃(회색). 체크아웃 기록이 없으면 태그를 안 붙인다.
const AttendanceTag = ({kind, label, time}: { kind: 'in' | 'out'; label: string; time?: string }) => {
  const style = kind === 'in'
    ? {box: 'bg-[#EAF7F4] text-[#1E9E8A]', dot: 'bg-[#1E9E8A]'}
    : {box: 'bg-[#F2F4F6] text-[#6D7882]', dot: 'bg-[#B1B8BE]'};
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold leading-none max-w-full ${style.box}`}
      style={{fontSize: 11, padding: '3px 7px', gap: 4}}
    >
      <span className={`shrink-0 rounded-full ${style.dot}`} style={{width: 4, height: 4}} />
      <span className="truncate">{time ? `${label} ${time}` : label}</span>
    </span>
  );
};
