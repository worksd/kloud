'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import calendarStyles from '@/app/kiosk/CalendarStyles.module.css';
import BackArrowIcon from '../../../public/assets/ic_back_arrow.svg';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {getKioskTicketByTokenAction, markKioskTicketUsedAction} from '@/app/kiosk/kiosk.actions';
import {getLessonTicketsAction} from '@/app/qrs/get.lesson.tickets.action';
import {getLessonsByDate} from '@/app/kiosk/get.lessons.by.date.action';
import {isGuinnessErrorCase} from '@/app/guinnessErrorCase';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {TicketResponse} from '@/app/endpoint/ticket.endpoint';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import QRScanner from '@/app/components/QRScanner';

type KioskLessonAttendanceFormProps = {
  studioId: number;
  onBack: () => void;
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  variant?: 'kiosk' | 'admin';
};

type Mode = 'qr' | 'manual';
type Status =
  | 'idle'          // QR 스캔 대기
  | 'loading'       // QR → 티켓 조회 중
  | 'manual-lesson' // 수업 선택
  | 'manual-input'  // 전화/이메일 입력
  | 'confirm'       // 이 수업 맞나요?
  | 'submitting'    // 출석 처리 중
  | 'complete'      // 완료
  | 'error';

// QR 스캔값에서 willUseTicketId(=티켓 id)와 token 쿼리 추출
const parseQr = (raw: string): { ticketId: number; token: string } | null => {
  try {
    const url = new URL(raw);
    const id = url.searchParams.get('willUseTicketId');
    const token = url.searchParams.get('token');
    if (!id || !/^\d+$/.test(id) || !token) return null;
    return {ticketId: Number(id), token};
  } catch {
    return null;
  }
};

const toAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const formatLessonTime = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const timePart = lesson.startDate.split(' ')[1];
    if (timePart) {
      const start = toAmPm(timePart);
      if (lesson.duration) {
        const [h, m] = timePart.split(':').map(Number);
        const endMinutes = h * 60 + m + lesson.duration;
        const endH = Math.floor(endMinutes / 60) % 24;
        const endM = endMinutes % 60;
        return `${start} - ${toAmPm(`${endH}:${String(endM).padStart(2, '0')}`)}`;
      }
      return start;
    }
  }
  if (lesson.formattedDate) {
    return `${toAmPm(lesson.formattedDate.startTime)} - ${toAmPm(lesson.formattedDate.endTime)}`;
  }
  return null;
};

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const formatLessonDay = (lesson: GetLessonResponse): string | null => {
  const datePart = lesson.startDate?.split(' ')[0] ?? (lesson.date ? lesson.date.replace(/\./g, '-').split(' ')[0] : undefined);
  if (datePart) {
    const [y, m, d] = datePart.split('-').map(Number);
    if (y && m && d) {
      const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
      return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${wd})`;
    }
  }
  return lesson.date ?? null;
};

const normalizePhone = (s: string) => s.replace(/\D/g, '');

// 입력값(전화 또는 이메일)으로 레슨 티켓 목록에서 동일 유저 찾기
const matchTickets = (tickets: TicketResponse[], input: string): TicketResponse[] => {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  if (q.includes('@')) {
    return tickets.filter((t) => (t.user?.email ?? '').toLowerCase() === q);
  }
  const digits = normalizePhone(q);
  if (!digits) return [];
  return tickets.filter((t) => normalizePhone(t.user?.phone ?? '') === digits);
};

const userDisplayName = (t: TicketResponse | null): string | null => {
  if (!t?.user) return null;
  return t.user.name || t.user.nickName || t.user.phone || t.user.email || null;
};

// 수업 출석 체크
//  - QR 모드: 네이티브 HID 스캐너(startQrScan) → onQrScanResult → willUseTicketId/token 파싱 → 티켓 조회
//  - 수동 모드: 수업 선택 → 전화/이메일 입력 → 해당 레슨 티켓에서 유저 매칭
//  두 경로 모두 확인 화면(이 수업 맞나요?) 후 toUsed로 출석 처리.
export const KioskLessonAttendanceForm = ({studioId, onBack, locale, onChangeLocale, variant = 'kiosk'}: KioskLessonAttendanceFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const admin = variant === 'admin';

  const [mode, setMode] = useState<Mode>('qr');
  const [status, setStatus] = useState<Status>('idle');
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 수동 모드 상태
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [selectedLesson, setSelectedLesson] = useState<GetLessonResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const busyRef = useRef(false);
  const modeRef = useRef<Mode>('qr');
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ── QR 모드 ──
  const handleScan = useCallback(async (raw: string) => {
    if (busyRef.current || modeRef.current !== 'qr') return;

    const parsed = parseQr(raw);
    if (!parsed) {
      setErrorMsg(t('coupon_qr_invalid'));
      setStatus('error');
      return;
    }

    busyRef.current = true;
    setStatus('loading');
    try {
      const res = await getKioskTicketByTokenAction(parsed.ticketId, parsed.token);
      if (isGuinnessErrorCase(res)) {
        setErrorMsg(t('kiosk_lesson_attendance_load_failed'));
        setStatus('error');
        return;
      }
      // Cancelled/CancelPending은 없는 것과 마찬가지, Used는 이미 출석 완료
      if (res.status === 'Cancelled' || res.status === 'CancelPending') {
        setErrorMsg(t('coupon_qr_invalid'));
        setStatus('error');
        return;
      }
      if (res.status === 'Used') {
        setErrorMsg(t('kiosk_lesson_attendance_already_done'));
        setStatus('error');
        return;
      }
      setSelectedLesson(res.lesson ?? null);
      setTicket(res);
      setStatus('confirm');
    } catch {
      setErrorMsg(t('kiosk_lesson_attendance_load_failed'));
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const startScan = useCallback(() => {
    setMode('qr');
    setTicket(null);
    setSelectedLesson(null);
    setErrorMsg(null);
    setStatus('idle');
    // 무인은 네이티브 HID 스캐너, admin은 브라우저 카메라(QRScanner)가 재마운트되며 스캔
    if (!admin) (window as any).KloudEvent?.startQrScan?.('');
  }, [admin]);

  // 무인 키오스크만 네이티브 startQrScan/onQrScanResult 사용. admin은 QRScanner(카메라)의 onSuccess로 처리.
  useEffect(() => {
    if (admin) return;
    const prev = (window as any).onQrScanResult;
    (window as any).onQrScanResult = (result: unknown) => {
      const text = typeof result === 'string' ? result : JSON.stringify(result);
      handleScan(text);
    };
    (window as any).KloudEvent?.startQrScan?.('');
    return () => {
      (window as any).onQrScanResult = prev;
    };
  }, [handleScan, admin]);

  // QRScanner(카메라) decode noise 무시, 실제 에러만 로깅
  const handleQrError = useCallback((errorMessage: string) => {
    if (
      !errorMessage.includes('MultiFormat Readers were able to detect the code') &&
      !errorMessage.includes('No barcode or QR code')
    ) {
      console.warn('QR scan error:', errorMessage);
    }
  }, []);

  // ── 수동 모드 ──
  const fetchLessonsForDate = useCallback(async (date: Date) => {
    setLessonsLoading(true);
    try {
      const res = await getLessonsByDate(studioId, formatApiDate(date));
      const list = 'lessons' in res ? res.lessons.filter((l) => l.status !== LessonStatus.Cancelled) : [];
      setLessons(list);
    } catch {
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [studioId]);

  const enterManual = useCallback(async () => {
    setMode('manual');
    setTicket(null);
    setSelectedLesson(null);
    setErrorMsg(null);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    setStatus('manual-lesson');
    await fetchLessonsForDate(today);
  }, [fetchLessonsForDate]);

  const handleSelectDate = useCallback((date: Date) => {
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
    fetchLessonsForDate(date);
  }, [fetchLessonsForDate]);

  const selectLesson = useCallback((lesson: GetLessonResponse) => {
    setSelectedLesson(lesson);
    setInputError(null);
    setStatus('manual-input');
  }, []);

  // 결제 플로우와 동일한 KioskPhoneInputForm이 전화/이메일을 넘겨줌 → 해당 레슨 티켓에서 매칭
  const searchInLesson = useCallback(async (query: string) => {
    if (!selectedLesson || searching) return;
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setInputError(null);
    try {
      const tickets = await getLessonTicketsAction(selectedLesson.id);
      // Cancelled/CancelPending은 없는 것과 마찬가지 → 매칭에서 제외
      const matches = matchTickets(tickets, q).filter((tk) => tk.status !== 'Cancelled' && tk.status !== 'CancelPending');
      if (matches.length === 0) {
        setInputError(t('kiosk_lesson_attendance_no_match'));
        return;
      }
      // 아직 출석 안 한(Used 아님) 티켓 우선. 전부 Used면 이미 출석 처리된 것.
      const usable = matches.find((tk) => tk.status !== 'Used');
      if (!usable) {
        setInputError(t('kiosk_lesson_attendance_already_done'));
        return;
      }
      setTicket(usable);
      setStatus('confirm');
    } catch {
      setInputError(t('kiosk_lesson_attendance_load_failed'));
    } finally {
      setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson, searching, locale]);

  // ── 공통: 출석 처리 ──
  const handleConfirmAttendance = useCallback(async () => {
    if (!ticket || busyRef.current) return;
    busyRef.current = true;
    setStatus('submitting');
    try {
      const lessonId = ticket.lesson?.id ?? selectedLesson?.id;
      const res = await markKioskTicketUsedAction(ticket.id, lessonId);
      if (isGuinnessErrorCase(res)) {
        setErrorMsg(res.message || t('kiosk_lesson_attendance_failed'));
        setStatus('error');
        return;
      }
      setStatus('complete');
    } catch {
      setErrorMsg(t('kiosk_lesson_attendance_failed'));
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, selectedLesson, locale]);

  // 완료/에러 후 "다시" 동작 — QR 모드면 재스캔, 수동 모드면 입력 화면으로
  const handleRetry = useCallback(() => {
    setTicket(null);
    setErrorMsg(null);
    if (mode === 'manual') {
      setInputError(null);
      setStatus(selectedLesson ? 'manual-input' : 'manual-lesson');
    } else {
      startScan();
    }
  }, [mode, selectedLesson, startScan]);

  // 헤더 뒤로가기 — 단계별 컨텍스트 이동, 최상위에서 홈으로
  const handleHeaderBack = useCallback(() => {
    if (mode === 'manual') {
      if (status === 'manual-lesson') { startScan(); return; }
      if (status === 'manual-input') { setStatus('manual-lesson'); return; }
      setStatus('manual-input'); // confirm/complete/error
      return;
    }
    if (status === 'confirm' || status === 'complete' || status === 'error') { startScan(); return; }
    onBack();
  }, [mode, status, onBack, startScan]);

  const displayLesson = ticket?.lesson ?? selectedLesson;

  // admin(태블릿)은 HID 스캐너가 없으므로 QR 대기 화면에서 카메라(QRScanner)를 연다.
  if (admin && status === 'idle') {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <QRScanner
          onSuccess={handleScan}
          onError={handleQrError}
          onBack={onBack}
          resultMessage={t('scan_qr_code')}
        />
        <button
          onClick={enterManual}
          className="fixed left-1/2 -translate-x-1/2 bottom-[40px] z-[10001] h-[60px] px-[36px] rounded-[16px] bg-white/90 flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] text-[20px] font-bold">{t('kiosk_lesson_attendance_manual_entry')}</span>
        </button>
      </div>
    );
  }

  // 전화/이메일 입력은 결제 플로우와 동일한 KioskPhoneInputForm 재사용 (전체화면)
  if (status === 'manual-input') {
    return (
      <KioskPhoneInputForm
        locale={locale}
        variant={variant}
        onBack={() => setStatus('manual-lesson')}
        onHome={onBack}
        onChangeLocale={onChangeLocale}
        onNext={(phone) => searchInLesson(phone)}
        onSearchByEmail={(email) => searchInLesson(email)}
        loading={searching}
        errorMessage={inputError}
        onDismissError={() => setInputError(null)}
      />
    );
  }

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div className="h-[70px] px-[32px] flex items-center shrink-0 relative">
        {status !== 'submitting' && (
          <button
            onClick={handleHeaderBack}
            className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity z-10"
          >
            <BackArrowIcon className="w-6 h-6"/>
          </button>
        )}
        <p className="absolute inset-0 flex items-center justify-center text-black text-[20px] font-bold pointer-events-none">
          {t('kiosk_lesson_attendance_title')}
        </p>
      </div>

      {/* 수동 모드 - 수업 선택: 좌 캘린더 / 우 선택 날짜의 수업 */}
      {status === 'manual-lesson' ? (
        <div className="flex-1 min-h-0 flex gap-[40px] px-[48px] pt-[16px] pb-[40px]">
          {/* 좌 — 캘린더 */}
          <div className="shrink-0 flex flex-col" style={{width: 420}}>
            <p className="text-black text-[24px] font-bold mb-[16px]">{t('kiosk_lesson_attendance_select_lesson')}</p>
            <div className={`${calendarStyles.calendarWrapper} bg-white rounded-[20px] border border-[#E6E8EA] p-[16px]`}>
              <Calendar
                onChange={(value) => { const d = Array.isArray(value) ? value[0] : value; if (d instanceof Date) handleSelectDate(d); }}
                value={selectedDate}
                formatDay={(_locale, d) => String(d.getDate())}
                locale="ko-KR"
                calendarType="gregory"
              />
            </div>
          </div>

          {/* 우 — 선택 날짜의 수업 목록 */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <p className="text-gray-500 text-[18px] mb-[12px] shrink-0">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 · {lessons.length}개 수업
            </p>
            {lessonsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[48px] h-[48px] border-4 border-gray-200 border-t-black rounded-full animate-spin"/>
              </div>
            ) : lessons.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-[22px]">{t('kiosk_lesson_attendance_no_lessons')}</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[12px]">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className="w-full bg-gray-50 rounded-[20px] p-[20px] flex items-center gap-[16px] active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-[72px] h-[72px] rounded-[14px] overflow-hidden bg-gray-200 shrink-0">
                      {lesson.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kioskImageSrc(lesson.thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[28px]">🕺</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
                      <p className="text-black text-[24px] font-bold leading-tight truncate">{lesson.title ?? '-'}</p>
                      {formatLessonTime(lesson) && (
                        <p className="text-gray-600 text-[17px]">{formatLessonTime(lesson)}</p>
                      )}
                      {(lesson.artists?.[0]?.nickName || lesson.room?.name) && (
                        <p className="text-gray-400 text-[15px] truncate">
                          {[lesson.artists?.[0]?.nickName, lesson.room?.name].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 그 외 상태 — 중앙 정렬 */
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] pb-[70px]">
          {/* 대기 — QR 스캔 안내 */}
          {status === 'idle' && (
            <>
              <div className="w-[96px] h-[96px] rounded-[28px] bg-[#F2F4F6] flex items-center justify-center mb-[40px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/ic_kiosk_attendance.svg" alt="" width={48} height={48} className="block"/>
              </div>
              <p className="text-black text-[40px] font-bold tracking-[-1px] text-center">
                {t('scan_qr_code')}
              </p>
              <button
                onClick={enterManual}
                className="mt-[48px] h-[64px] px-[36px] rounded-[16px] border-2 border-gray-200 text-black text-[22px] font-medium active:bg-gray-50 transition-colors"
              >
                {t('kiosk_lesson_attendance_manual_entry')}
              </button>
            </>
          )}

          {/* 조회 중 */}
          {status === 'loading' && (
            <>
              <div className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {t('kiosk_lesson_attendance_loading')}
              </p>
            </>
          )}

          {/* 확인 — 이 수업 맞나요? */}
          {status === 'confirm' && displayLesson && (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[8px] text-center">
                {t('kiosk_lesson_attendance_confirm_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[36px] text-center">
                {t('kiosk_lesson_attendance_confirm_desc')}
              </p>

              <div className="w-full max-w-[560px] bg-gray-50 rounded-[24px] p-[24px] flex items-center gap-[20px] mb-[24px]">
                <div className="w-[96px] h-[96px] rounded-[16px] overflow-hidden bg-gray-200 shrink-0">
                  {displayLesson.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kioskImageSrc(displayLesson.thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[32px]">🕺</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
                  <p className="text-black text-[26px] font-bold leading-tight truncate">{displayLesson.title ?? '-'}</p>
                  {(formatLessonDay(displayLesson) || formatLessonTime(displayLesson)) && (
                    <p className="text-gray-600 text-[18px]">
                      {[formatLessonDay(displayLesson), formatLessonTime(displayLesson)].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {(displayLesson.artists?.[0]?.nickName || displayLesson.room?.name) && (
                    <p className="text-gray-400 text-[16px] truncate">
                      {[displayLesson.artists?.[0]?.nickName, displayLesson.room?.name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {userDisplayName(ticket) && (
                <div className="w-full max-w-[560px] flex items-center justify-center gap-[8px] mb-[36px]">
                  <span className="text-gray-400 text-[18px]">{t('kiosk_label_name')}</span>
                  <span className="text-black text-[22px] font-bold">{userDisplayName(ticket)}</span>
                </div>
              )}

              <div className="w-full max-w-[560px] flex flex-col gap-[12px]">
                <button
                  onClick={handleConfirmAttendance}
                  className="w-full h-[72px] rounded-[16px] bg-black text-white text-[22px] font-bold transition-colors"
                >
                  {t('kiosk_lesson_attendance_confirm_btn')}
                </button>
                <button
                  onClick={handleRetry}
                  className="w-full h-[72px] rounded-[16px] border-2 border-gray-200 text-black text-[22px] font-medium transition-colors"
                >
                  {mode === 'manual' ? t('kiosk_lesson_attendance_search') : t('kiosk_lesson_attendance_rescan')}
                </button>
              </div>
            </>
          )}

          {/* 출석 처리 중 */}
          {status === 'submitting' && (
            <>
              <div className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {t('kiosk_lesson_attendance_processing')}
              </p>
            </>
          )}

          {/* 완료 */}
          {status === 'complete' && (
            <>
              <div className="w-[96px] h-[96px] rounded-full bg-black flex items-center justify-center mb-[32px]">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[8px] text-center">
                {t('kiosk_lesson_attendance_complete')}
              </p>
              {userDisplayName(ticket) && (
                <p className="text-gray-400 text-[20px] mb-[36px] text-center">{userDisplayName(ticket)}</p>
              )}
              <button
                onClick={handleRetry}
                className="w-full max-w-[560px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-bold transition-colors mt-[16px]"
              >
                {mode === 'manual' ? t('kiosk_lesson_attendance_search') : t('kiosk_lesson_attendance_rescan')}
              </button>
            </>
          )}

          {/* 에러 */}
          {status === 'error' && (
            <>
              <div className="w-[96px] h-[96px] rounded-full bg-red-50 flex items-center justify-center mb-[32px]">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v5M12 16.5v.5" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px] mb-[36px] text-center">
                {errorMsg ?? t('kiosk_lesson_attendance_load_failed')}
              </p>
              <button
                onClick={handleRetry}
                className="w-full max-w-[560px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-bold transition-colors"
              >
                {mode === 'manual' ? t('kiosk_lesson_attendance_search') : t('kiosk_lesson_attendance_rescan')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
