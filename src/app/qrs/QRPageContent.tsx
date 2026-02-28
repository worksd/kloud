'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import QRScanner from '@/app/components/QRScanner';
import { useAction } from '@/app/qrs/use.action';
import { GetLessonResponse, LessonStatus } from '@/app/endpoint/lesson.endpoint';
import { kloudNav } from '@/app/lib/kloudNav';
import { createDialog } from '@/utils/dialog.factory';
import { getLessonsByDate } from '@/app/profile/setting/kiosk/get.lessons.by.date.action';
import { Thumbnail } from '@/app/components/Thumbnail';

type AttendanceRecord = {
  ticketId: number;
  userName: string;
  ticketType: string;
  time: string;
};

type SuccessDialogData = {
  user: {
    profileImageUrl?: string;
    name?: string;
    nickName?: string;
  };
  ticketType?: 'default' | 'premium' | 'membership';
  ticketTypeLabel?: string;
  lessonTitle?: string;
  rank?: string;
};

type Props = {
  lesson: GetLessonResponse | null;
  studioId?: number | null;
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getTodayKST = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
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
        const end = toAmPm(`${endH}:${String(endM).padStart(2, '0')}`);
        return `${start} - ${end}`;
      }
      return start;
    }
  }
  if (lesson.formattedDate) {
    return `${toAmPm(lesson.formattedDate.startTime)} - ${toAmPm(lesson.formattedDate.endTime)}`;
  }
  return null;
};

const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  for (let d = 1; d <= lastDate; d++) {
    days.push({ day: d, month, year, isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  return days;
};

export default function QRPageContent({ lesson: initialLesson, studioId }: Props) {
  const [selectedLesson, setSelectedLesson] = useState<GetLessonResponse | null>(initialLesson);
  const [showLessonDialog, setShowLessonDialog] = useState(!initialLesson && !!studioId);
  const lesson = selectedLesson;
  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState<'idle' | 'success' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [successDialog, setSuccessDialog] = useState<SuccessDialogData | null>(null);
  const isScanning = useRef(false);
  const lastScanTime = useRef<number>(0);
  const successTicketIds = useRef<Set<number>>(new Set([]));

  const parseTicketParams = useCallback((urlStr: string): { ticketId: number; expiredAt?: string } | null => {
    try {
      const url = new URL(urlStr);
      const id = url.searchParams.get('willUseTicketId');
      const expiredAt = url.searchParams.get('expiredAt');
      if (!id || !/^\d+$/.test(id)) return null;
      return { ticketId: Number(id), expiredAt: expiredAt || undefined };
    } catch {
      return null;
    }
  }, []);

  const onSuccess = useCallback(
    async (decodedText: string) => {
      console.log('[QR] onSuccess 호출됨:', decodedText);

      // 다이얼로그가 열려있으면 스킵
      if (successDialog) {
        console.log('[QR] 다이얼로그 열려있음');
        return;
      }

      // 현재 API 호출 중이면 스킵
      if (isScanning.current) {
        console.log('[QR] 이미 API 호출 중');
        return;
      }

      // 마지막 스캔 후 3초 딜레이
      const now = Date.now();
      if (now - lastScanTime.current < 3000) {
        console.log('[QR] 딜레이 중');
        return;
      }

      const params = parseTicketParams(decodedText);
      console.log('[QR] 파라미터 파싱:', params);

      if (!params) {
        setResultState('error');
        setResultMessage('올바르지 않은 QR 코드입니다.');
        setTimeout(() => {
          setResultState('idle');
          setResultMessage('');
        }, 2000);
        return;
      }

      const { ticketId, expiredAt } = params;

      // 이미 성공한 ticketId면 아무것도 하지 않고 return
      if (successTicketIds.current.has(ticketId)) {
        console.log('[QR] 이미 출석 완료된 티켓:', ticketId);
        return;
      }

      // 로딩 시작
      isScanning.current = true;
      setLoading(true);
      setResultState('idle');
      setResultMessage('');
      console.log('[QR] 로딩 시작, API 호출:', { ticketId, expiredAt, lessonId: lesson?.id });

      try {
        const result = await useAction({
          ticketId,
          expiredAt,
          lessonId: lesson?.id,
        });

        console.log('[QR] API 응답:', result);
        console.log('[QR] result 타입:', typeof result);
        console.log('[QR] message in result:', 'message' in result);
        console.log('[QR] id in result:', 'id' in result);

        if ('message' in result) {
          // 에러 응답 - 서버 메시지를 다이얼로그로 표시
          const dialog = await createDialog({
            id: 'Simple',
            title: '알림',
            message: result.message || 'QR 출석에 실패했습니다.',
          });
          if (dialog && window.KloudEvent) {
            window.KloudEvent.showDialog(JSON.stringify(dialog));
          }
        } else if ('id' in result) {
          // 성공 응답 - ticketId 저장
          successTicketIds.current.add(ticketId);

          const userName = result.user?.nickName || result.user?.name || '사용자';
          const ticketLabel = result.ticketTypeLabel || '';

          // 출석 목록에 추가
          const newRecord: AttendanceRecord = {
            ticketId,
            userName,
            ticketType: ticketLabel,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          };
          setAttendanceList(prev => [newRecord, ...prev]);

          // 성공 다이얼로그 표시
          setSuccessDialog({
            user: {
              profileImageUrl: result.user?.profileImageUrl,
              name: result.user?.name,
              nickName: result.user?.nickName,
            },
            ticketType: result.ticketType,
            ticketTypeLabel: result.ticketTypeLabel,
            lessonTitle: result.lesson?.title,
            rank: result.rank,
          });

          setResultState('success');
          setResultMessage('출석이 완료되었습니다!');
        }
      } catch (error) {
        console.error('[QR] API 에러:', error);
        // 네트워크 오류를 다이얼로그로 표시
        const dialog = await createDialog({
          id: 'Simple',
          title: '알림',
          message: '네트워크 오류가 발생했습니다.',
        });
        if (dialog && window.KloudEvent) {
          window.KloudEvent.showDialog(JSON.stringify(dialog));
        }
      } finally {
        isScanning.current = false;
        setLoading(false);
        // 성공/실패 모두 3초 딜레이 적용
        lastScanTime.current = Date.now();
        console.log('[QR] 로딩 종료');
        // 3초 후 상태 초기화
        setTimeout(() => {
          setResultState('idle');
          setResultMessage('');
        }, 3000);
      }
    },
    [parseTicketParams, lesson?.id, successDialog]
  );

  // ── 수업 선택 다이얼로그 상태 ──
  const today = getTodayKST();
  const [dialogDate, setDialogDate] = useState(() => getTodayKST());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [dialogLessons, setDialogLessons] = useState<GetLessonResponse[]>([]);

  const dialogDateString = useMemo(() => formatDateForAPI(dialogDate), [dialogDate]);

  useEffect(() => {
    if (!showLessonDialog || !studioId) return;
    const fetchLessons = async () => {
      try {
        const response = await getLessonsByDate(studioId, dialogDateString);
        if ('lessons' in response) {
          setDialogLessons(response.lessons);
        } else {
          setDialogLessons([]);
        }
      } catch {
        setDialogLessons([]);
      }
    };
    fetchLessons();
  }, [dialogDateString, studioId, showLessonDialog]);

  const filteredDialogLessons = dialogLessons.filter((l) => l.status !== LessonStatus.Cancelled && l.price != null);
  const calendarDays = getCalendarDays(calendarYear, calendarMonth);
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const onError = useCallback((errorMessage: string) => {
    if (
      !errorMessage.includes('MultiFormat Readers were able to detect the code') &&
      !errorMessage.includes('No barcode or QR code')
    ) {
      console.warn('QR scan error:', errorMessage);
    }
  }, []);

  const handleBack = useCallback(() => {
    kloudNav.back();
  }, []);


  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#000' }}>
      <QRScanner onSuccess={onSuccess} onError={onError} onBack={handleBack} isProcessing={loading} resultState={resultState} resultMessage={resultMessage} lessonId={lesson?.id?.toString()} lessonTitle={lesson?.title} />

      {/* 레슨 정보 카드 */}
      {lesson && (
        <div
          style={{
            position: 'fixed',
            top: 100,
            left: 12,
            right: 12,
            zIndex: 10002,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {lesson.thumbnailUrl && (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#333',
                }}
              >
                <Image
                  src={lesson.thumbnailUrl}
                  alt={lesson.title ?? ''}
                  width={56}
                  height={56}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}
              >
                {lesson.title}
              </div>
              {lesson.date && (
                <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {lesson.date}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 500,
            zIndex: 10003,
          }}
        >
          <div className="qr-loading-spinner" />
          <span>출석 처리 중...</span>
        </div>
      )}

      {/* 출석 성공 토스트 */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 120,
            left: 12,
            right: 12,
            zIndex: 10004,
            backgroundColor: 'rgba(34, 197, 94, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: '14px 16px',
            color: 'white',
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 출석 목록 (왼쪽 위) */}
      {attendanceList.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: lesson ? 190 : 100,
            left: 8,
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: 8,
            padding: 8,
            maxHeight: '30vh',
            overflowY: 'auto',
            minWidth: 140,
          }}
        >
          <div style={{ color: '#22C55E', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
            출석 ({attendanceList.length}명)
          </div>
          {attendanceList.map((record) => (
            <div
              key={record.ticketId}
              style={{
                fontSize: 11,
                color: 'white',
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ fontWeight: 500 }}>{record.userName}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>
                {record.ticketType && `${record.ticketType} · `}{record.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수업 선택 다이얼로그 */}
      {showLessonDialog && studioId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 10006,
          }}
          onClick={() => setShowLessonDialog(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxHeight: '85vh',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 핸들바 + 헤더 */}
            <div style={{ padding: '12px 20px 8px' }}>
              <div style={{ width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, margin: '0 auto 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#000' }}>수업 선택</div>
                <button
                  onClick={() => setShowLessonDialog(false)}
                  style={{ fontSize: 14, color: '#9CA3AF', background: 'none', border: 'none' }}
                >
                  건너뛰기
                </button>
              </div>
            </div>

            {/* 달력 */}
            <div style={{ padding: '8px 20px' }}>
              {/* 월 네비게이션 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <button
                  onClick={() => {
                    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                    else setCalendarMonth(calendarMonth - 1);
                  }}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'none', border: 'none', fontSize: 16, color: '#4B5563' }}
                >{'<'}</button>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>
                  {calendarYear}년 {calendarMonth + 1}월
                </div>
                <button
                  onClick={() => {
                    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                    else setCalendarMonth(calendarMonth + 1);
                  }}
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'none', border: 'none', fontSize: 16, color: '#4B5563' }}
                >{'>'}</button>
              </div>

              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={label} style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#9CA3AF' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {calendarDays.map((dateInfo, idx) => {
                  const isSelected =
                    dateInfo.day === dialogDate.getDate() &&
                    dateInfo.month === dialogDate.getMonth() &&
                    dateInfo.year === dialogDate.getFullYear();
                  const isToday =
                    dateInfo.day === todayDay &&
                    dateInfo.month === todayMonth &&
                    dateInfo.year === todayYear;
                  const isSunday = idx % 7 === 0;
                  const isSaturday = idx % 7 === 6;

                  let color = '#000';
                  if (!dateInfo.isCurrentMonth) color = '#D1D5DB';
                  else if (isSunday) color = '#EF4444';
                  else if (isSaturday) color = '#3B82F6';
                  if (isSelected) color = '#fff';

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 0' }}>
                      <button
                        onClick={() => setDialogDate(new Date(dateInfo.year, dateInfo.month, dateInfo.day, 0, 0, 0, 0))}
                        style={{
                          width: 30, height: 30, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: isSelected ? '#000' : 'transparent',
                          border: !isSelected && isToday ? '2px solid #000' : 'none',
                          fontSize: 12, fontWeight: isSelected ? 700 : 500,
                          color,
                        }}
                      >
                        {dateInfo.day}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 선택된 날짜 + 수업 수 */}
            <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
                {dialogDate.getMonth() + 1}월 {dialogDate.getDate()}일 ({WEEKDAY_LABELS[dialogDate.getDay()]})
              </span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                {filteredDialogLessons.length}개 수업
              </span>
            </div>

            {/* 수업 목록 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', minHeight: 0 }}>
              {filteredDialogLessons.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>수업이 없습니다</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredDialogLessons.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setSelectedLesson(l);
                        setShowLessonDialog(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 12, borderRadius: 12, cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        {l.thumbnailUrl ? (
                          <Thumbnail url={l.thumbnailUrl} className="w-full h-full" aspectRatio={1} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#9CA3AF' }}>🕺</span>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        {formatLessonTime(l) && (
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{formatLessonTime(l)}</div>
                        )}
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {[l.artists?.[0]?.nickName, l.room?.name].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 출석 성공 다이얼로그 */}
      {successDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10005,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              width: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* 프로필 이미지 + 체크 */}
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <Image
                src={successDialog.user.profileImageUrl || '/assets/default_profile.png'}
                alt="profile"
                width={52}
                height={52}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* 이름 */}
            <div style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>
              {successDialog.user.nickName || successDialog.user.name || '사용자'}
            </div>

            {/* 입장 번호 */}
            {successDialog.rank && (
              <div style={{ fontSize: 13, color: '#666' }}>
                {successDialog.rank}
              </div>
            )}

            {/* 멤버십 라벨 */}
            {successDialog.ticketTypeLabel && successDialog.ticketType !== 'default' && (
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: successDialog.ticketType === 'membership'
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : 'linear-gradient(135deg, #9333EA, #DB2777)',
                  color: successDialog.ticketType === 'membership' ? '#000' : '#fff',
                }}
              >
                {successDialog.ticketTypeLabel}
              </div>
            )}

            {/* 확인 버튼 */}
            <button
              onClick={() => {
                setSuccessDialog(null);
                setResultState('idle');
                setResultMessage('');
              }}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '10px 0',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
                border: 'none',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
