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
const monthRange = (d: Date) => ({
  startDate: ymd(new Date(d.getFullYear(), d.getMonth(), 1)),
  endDate: ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
});

type KioskAttendanceFormProps = {
  onBack: () => void;
  onHome: () => void;
  onComplete: () => void;
  locale: Locale;
  /** 'admin'(상담실)이면 자동 홈복귀 미동작 */
  variant?: 'kiosk' | 'admin';
};

export const KioskAttendanceForm = ({onBack, onHome, locale, variant = 'kiosk'}: KioskAttendanceFormProps) => {
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
  const [flash, setFlash] = useState<string | null>(null); // 체크인/아웃 완료 안내
  // 오늘 출석 여부 — 뷰 월과 무관하게 별도 조회로 관리(달력 이동해도 안 틀어지도록)
  const [todayAttended, setTodayAttended] = useState(false);

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
      setTodayAttended(!isGuinnessErrorCase(res) && (res.attendances ?? []).some((a) => a.date === todayStr));
    } catch {
      setTodayAttended(false);
    }
  }, [todayStr]);

  const selectUser = (u: GetUserResponse) => {
    setUser(u);
    setError(null);
    const now = new Date();
    setViewMonth(now);
    setStep('detail');
    fetchAttendances(u.id, now);
    refreshToday(u.id);
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

  // 오늘 출석 기록 유무 → 없으면 체크인, 있으면 체크아웃
  const nextStatus: AttendanceStatus = todayAttended ? 'CheckOut' : 'CheckIn';

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
        setFlash(nextStatus === 'CheckIn' ? t('kiosk_check_in_complete') : t('kiosk_check_out_complete'));
        await Promise.all([fetchAttendances(user.id, viewMonth), refreshToday(user.id)]);
        setTimeout(() => setFlash(null), 2500);
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
  const cells: (number | null)[] = [
    ...Array(leadBlanks).fill(null),
    ...Array.from({length: lastDate}, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
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

      <div className="flex-1 min-h-0 flex flex-col px-[48px] pt-[4px] pb-[24px]">
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

        {/* 달력 그리드 — 각 칸에 출결(체크인~체크아웃) 표시 */}
        <div className="flex-1 min-h-0 grid grid-cols-7 gap-[6px]" style={{gridAutoRows: '1fr'}}>
          {cells.map((day, idx) => {
            if (day == null) return <div key={`b-${idx}`} />;
            const dateStr = ymd(new Date(vy, vm, day));
            const recs = recsByDate.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            const dow = idx % 7;
            return (
              <div key={dateStr} className={`min-h-0 rounded-[12px] border p-[7px] flex flex-col overflow-hidden ${isToday ? 'border-[#1E2124] bg-[#F7F8F9]' : 'border-[#EEF0F2]'}`}>
                <span className={`text-[14px] font-bold ${isToday ? 'text-[#1E2124]' : dow === 0 ? 'text-[#E0533F]' : 'text-[#4E5968]'}`}>{day}</span>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-[2px] mt-[2px]">
                  {recs.map((r) => (
                    <span key={r.id} className="text-[11px] font-bold text-[#1E9E8A] leading-tight truncate">
                      {r.checkInTime}{r.checkOutTime ? `~${r.checkOutTime}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 완료 안내 / 에러 */}
        {flash && <div className="shrink-0 mt-[12px] rounded-[14px] bg-[#EAF7F4] text-[#1E9E8A] text-[18px] font-bold text-center py-[12px]">{flash}</div>}
        {error && <p className="shrink-0 mt-[12px] text-red-500 text-[16px] text-center">{error}</p>}

        {/* 체크인/체크아웃 — 오늘 출석 없으면 체크인, 있으면 체크아웃 */}
        <button
          onClick={submitAttendance}
          disabled={submitting}
          className={`shrink-0 mt-[16px] w-full h-[76px] rounded-[16px] flex items-center justify-center transition-transform active:scale-[0.98] ${
            todayAttended ? 'bg-[#E0533F]' : 'bg-[#1E2124]'
          } ${submitting ? 'opacity-60' : ''}`}
        >
          {submitting ? (
            <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-white text-[24px] font-bold">
              {todayAttended ? t('kiosk_check_out_do') : t('kiosk_check_in_do')}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
