'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import calendarStyles from '@/app/kiosk/CalendarStyles.module.css';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {getKioskTicketAction, getKioskTicketByTokenAction, markKioskTicketUsedAction} from '@/app/kiosk/kiosk.actions';
import {getLessonTicketsAction} from '@/app/qrs/get.lesson.tickets.action';
import {getLessonsByDate} from '@/app/kiosk/get.lessons.by.date.action';
import {isGuinnessErrorCase} from '@/app/guinnessErrorCase';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {TicketResponse} from '@/app/endpoint/ticket.endpoint';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import QRScanner from '@/app/components/QRScanner';
import {KioskTopBar} from '@/app/kiosk/KioskTopBar';

type KioskLessonAttendanceFormProps = {
  studioId: number;
  onBack: () => void;
  onHome: () => void;
  locale: Locale;
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

// QR 스캔값에서 willUseTicketId(=티켓 id)와 token 쿼리 추출.
// QR 값은 전체 URL(https://...?a=b), 스킴 딥링크(rawgraphy://...?a=b), 또는 쿼리문자열만
// (willUseTicketId=1&token=x) 어떤 형태든 올 수 있으므로 모두 허용한다.
// token은 옵션 — 앱 티켓 QR은 willUseTicketId+expiredAt만 담고 token이 없는 경우가 있다.
const parseQr = (raw: string): { ticketId: number; token?: string } | null => {
  const readParams = (search: string) => {
    const params = new URLSearchParams(search);
    const id = params.get('willUseTicketId') ?? params.get('ticketId');
    const token = params.get('token');
    if (!id || !/^\d+$/.test(id)) return null;
    return { ticketId: Number(id), token: token ?? undefined };
  };
  try {
    const parsed = readParams(new URL(raw).search);
    if (parsed) return parsed;
  } catch {
    // 전체 URL 파싱 실패 → 아래 쿼리문자열 취급으로 폴백
  }
  const q = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : raw;
  return readParams(q);
};

// 네이티브 onQrScanResult 페이로드에서 QR 문자열만 뽑는다.
// 브릿지 구현에 따라 문자열로 오기도, { code|data|result|... } 객체로 오기도 하고,
// 스캔 시작 시점에 빈 페이로드가 한 번 들어오기도 한다. 쓸 값이 없으면 null → 조용히 무시.
const QR_TEXT_KEYS = ['code', 'data', 'result', 'value', 'text', 'qr', 'qrCode', 'qrcode', 'content', 'raw', 'scanResult', 'payload', 'url'];
const extractQrText = (result: unknown): string | null => {
  if (typeof result === 'string') return result.trim() || null;
  if (!result || typeof result !== 'object') return null;
  const obj = result as Record<string, unknown>;
  for (const key of QR_TEXT_KEYS) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    // { data: { code: '...' } } 처럼 한 겹 더 감싼 형태도 허용
    if (v && typeof v === 'object') {
      const nested = extractQrText(v);
      if (nested) return nested;
    }
  }
  // 키 이름이 예상과 다르면 값들 중 QR처럼 생긴 문자열을 찾는다
  for (const v of Object.values(obj)) {
    if (typeof v === 'string' && (v.includes('willUseTicketId') || v.includes('://'))) return v.trim();
  }
  return null;
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
export const KioskLessonAttendanceForm = ({studioId, onBack, onHome, locale, variant = 'kiosk'}: KioskLessonAttendanceFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const admin = variant === 'admin';

  const [mode, setMode] = useState<Mode>('qr');
  const [status, setStatus] = useState<Status>('idle');
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // 파싱 실패한 스캔 원본값 — 에러 화면에 작게 노출(스캐너가 뭘 보냈는지 현장에서 확인용)
  const [lastRaw, setLastRaw] = useState<string | null>(null);

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

    // 빈 스캔값(startQrScan 초기 트리거·네이티브 빈 결과 등)은 에러 없이 무시 — 대기 유지
    if (!raw || !raw.trim()) return;

    const parsed = parseQr(raw);
    if (!parsed) {
      // 진단용 — 어떤 값이 들어왔는지 화면/콘솔에 남긴다 (스캐너 페이로드 형태 확인)
      console.warn('[kiosk qr] parse failed:', raw);
      setLastRaw(raw);
      setErrorMsg(t('coupon_qr_invalid'));
      setStatus('error');
      return;
    }

    busyRef.current = true;
    setStatus('loading');
    try {
      // token이 있으면 토큰 조회, 없으면 운영자 권한으로 티켓 직접 조회
      const res = parsed.token
        ? await getKioskTicketByTokenAction(parsed.ticketId, parsed.token)
        : await getKioskTicketAction(parsed.ticketId);
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
    setLastRaw(null);
    setStatus('idle');
    // 무인은 네이티브 HID 스캐너, admin은 브라우저 카메라(QRScanner)가 재마운트되며 스캔
    if (!admin) (window as any).KloudEvent?.startQrScan?.('');
  }, [admin]);

  // 무인 키오스크만 네이티브 startQrScan/onQrScanResult 사용. admin은 QRScanner(카메라)의 onSuccess로 처리.
  useEffect(() => {
    if (admin) return;
    const prev = (window as any).onQrScanResult;
    (window as any).onQrScanResult = (result: unknown) => {
      // 페이로드가 객체로 와도 QR 문자열만 뽑아 넘긴다.
      // 뽑을 값이 없으면(스캔 시작 시 빈 콜백 등) 에러 대신 조용히 무시 — 대기 상태 유지.
      const text = extractQrText(result);
      if (!text) {
        console.log('[kiosk qr] ignored payload:', result);
        return;
      }
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
    // QR 모드: 에러 화면은 뒤로가기로 밖으로 나가고, confirm/complete는 다시 스캔.
    if (status === 'error') { onBack(); return; }
    if (status === 'confirm' || status === 'complete') { startScan(); return; }
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
        onNext={(phone) => searchInLesson(phone)}
        onSearchByEmail={(email) => searchInLesson(email)}
        loading={searching}
        errorMessage={inputError}
        onDismissError={() => setInputError(null)}
      />
    );
  }

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col animate-[fadeIn_260ms_ease-out]">
      <KioskTopBar
        title={t('kiosk_lesson_attendance_title')}
        onBack={status !== 'submitting' ? handleHeaderBack : undefined}
        onHome={onHome}
      />

      {/* 수동 모드 - 수업 선택.
          admin(태블릿 가로) = 좌 캘린더 / 우 수업 그리드,
          kiosk(세로 화면)  = 위 캘린더 / 아래 수업 그리드.
          수업은 lesson-list와 같은 방식(포스터 크게 + 하단 정보)으로 뿌린다. */}
      {status === 'manual-lesson' ? (
        <div className={`flex-1 min-h-0 px-[48px] pt-[8px] pb-[32px] flex ${admin ? 'flex-row gap-[40px]' : 'flex-col'}`}>
          {/* 캘린더 */}
          <div className={`shrink-0 flex flex-col ${admin ? '' : 'items-center'}`} style={admin ? {width: 440} : undefined}>
            <p className="text-black text-[24px] font-bold mb-[12px]">{t('kiosk_lesson_attendance_select_lesson')}</p>
            <div
              className={`${calendarStyles.calendarWrapper} bg-white rounded-[20px] border border-[#E6E8EA] p-[14px] w-full`}
              style={admin ? undefined : {maxWidth: 620}}
            >
              <Calendar
                onChange={(value) => { const d = Array.isArray(value) ? value[0] : value; if (d instanceof Date) handleSelectDate(d); }}
                value={selectedDate}
                formatDay={(_locale, d) => String(d.getDate())}
                locale="ko-KR"
                calendarType="gregory"
              />
            </div>
          </div>

          {/* 수업 그리드 — 날짜가 바뀌면 remount(key)해서 fade로 교체 */}
          <div className={`flex-1 min-w-0 min-h-0 flex flex-col ${admin ? '' : 'mt-[20px]'}`}>
            <p className="shrink-0 text-gray-500 text-[18px] mb-[12px]">
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
              <div
                key={formatApiDate(selectedDate)}
                className="flex-1 min-h-0 overflow-y-auto grid grid-cols-3 gap-[16px] animate-[fadeIn_220ms_ease-out]"
                style={{gridAutoRows: 'min-content'}}
              >
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className="w-full rounded-[18px] border border-[#F1F3F6] bg-white overflow-hidden flex flex-col text-left active:bg-[#F7F8F9] transition-colors"
                  >
                    {/* 포스터 — 카드 전체 폭 */}
                    <div className="relative w-full aspect-[3/4] bg-[#F1F3F6] overflow-hidden">
                      {lesson.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kioskImageSrc(lesson.thumbnailUrl, 600)} alt="" className="absolute inset-0 w-full h-full object-cover"/>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[40px]">🕺</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-[4px] p-[14px]">
                      {formatLessonTime(lesson) && (
                        <p className="text-[#4E5968] text-[15px] font-bold truncate">{formatLessonTime(lesson)}</p>
                      )}
                      <p className="text-black text-[19px] font-bold leading-snug line-clamp-1">{lesson.title ?? '-'}</p>
                      {(lesson.artists?.[0]?.nickName || lesson.room?.name) && (
                        <p className="text-[#8B95A1] text-[14px] truncate">
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
        /* 그 외 상태 — 중앙 정렬. status가 바뀌면 remount(key)해서 상태 전환도 fade로 */
        <div key={status} className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] pb-[70px] animate-[fadeIn_220ms_ease-out]">
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
              {/* 누가·어떤 수업에 출석 처리됐는지 — 이름만이 아니라 프로필/닉네임/연락처/수업까지 */}
              {(ticket?.user || displayLesson) && (
                <div className="w-full max-w-[560px] mt-[20px] mb-[16px] rounded-[18px] bg-[#F7F8F9] px-[22px] py-[20px] flex flex-col gap-[14px]">
                  {ticket?.user && (
                    <div className="flex items-center gap-[14px] min-w-0">
                      <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {ticket.user.profileImageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={kioskImageSrc(ticket.user.profileImageUrl, 160)} alt="" className="w-full h-full object-cover"/>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-black text-[22px] font-bold truncate">
                          {ticket.user.name || ticket.user.nickName || '-'}
                          {ticket.user.name && ticket.user.nickName && (
                            <span className="text-[#8B95A1] text-[17px] font-medium">{` (${ticket.user.nickName})`}</span>
                          )}
                        </p>
                        <p className="text-[#8B95A1] text-[16px] truncate">
                          {[ticket.user.phone, ticket.user.email].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {displayLesson && (
                    <>
                      <div className="h-px bg-[#E8EAED]"/>
                      <div className="text-left min-w-0">
                        <p className="text-black text-[19px] font-bold truncate">{displayLesson.title ?? '-'}</p>
                        <p className="text-[#8B95A1] text-[16px] truncate">
                          {[formatLessonDay(displayLesson), formatLessonTime(displayLesson), ticket?.ticketTypeLabel]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={handleRetry}
                className="w-full max-w-[560px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-bold transition-colors mt-[16px]"
              >
                {mode === 'manual' ? t('kiosk_lesson_attendance_search') : t('kiosk_lesson_attendance_rescan')}
              </button>
              {/* 연속 스캔이 아닌 경우를 위한 홈 복귀 */}
              <button
                onClick={onHome}
                className="w-full max-w-[560px] h-[72px] rounded-[16px] bg-[#F2F4F6] text-[#1E2124] text-[22px] font-bold transition-transform active:scale-[0.98] mt-[12px]"
              >
                {t('kiosk_go_home')}
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
              <p className="text-black text-[28px] font-bold tracking-[-0.84px] text-center">
                {errorMsg ?? t('kiosk_lesson_attendance_load_failed')}
              </p>
              {/* 스캔 원본값 — 어떤 값이 들어와 실패했는지 현장에서 바로 확인 */}
              {lastRaw && (
                <p className="mt-[12px] max-w-[560px] text-[#B1B8BE] text-[13px] text-center break-all line-clamp-3">
                  {lastRaw}
                </p>
              )}
              <div className="h-[36px]" />
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
