'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import QRScanner from '@/app/components/QRScanner';
import { useAction } from '@/app/qrs/use.action';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { kloudNav } from '@/app/lib/kloudNav';
import { DialogInfo } from '@/utils/dialog.factory';
import { createDialog } from '@/utils/dialog.factory';
import { TicketResponse } from '@/app/endpoint/ticket.endpoint';

type LessonInfo = GetLessonResponse;

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

export default function QRPageContent({ lesson }: { lesson?: LessonInfo }) {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState<'idle' | 'success' | 'error'>('idle');
  const [resultMessage, setResultMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [successDialog, setSuccessDialog] = useState<SuccessDialogData | null>(null);
  const isScanning = useRef(false);
  const lastScanTime = useRef<number>(0);
  const successTicketIds = useRef<Set<number>>(new Set([]));

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      console.log('[QR] 로딩 시작, API 호출:', { ticketId, expiredAt, lessonId });

      try {
        const result = await useAction({
          ticketId,
          expiredAt,
          lessonId: lessonId ? Number(lessonId) : undefined,
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
    [parseTicketParams, lessonId, successDialog]
  );

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
      <QRScanner onSuccess={onSuccess} onError={onError} onBack={handleBack} isProcessing={loading} resultState={resultState} resultMessage={resultMessage} />

      {/* 레슨 정보 카드 */}
      {lesson && (
        <div
          style={{
            position: 'fixed',
            top: 100,
            left: 12,
            right: 12,
            zIndex: 90,
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
                  marginBottom: 6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {lesson.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                <span>{lesson.artist?.nickName || lesson.artist?.name}</span>
                <span>•</span>
                <span>{lesson.currentStudentCount}/{lesson.limit}명</span>
              </div>
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
            zIndex: 1000,
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
            zIndex: 1001,
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
            zIndex: 80,
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

      {/* 출석 성공 다이얼로그 */}
      {successDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* 멤버십 라벨 */}
            {successDialog.ticketTypeLabel && (
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: 20,
                  marginBottom: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  background: successDialog.ticketType === 'membership'
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : successDialog.ticketType === 'premium'
                    ? 'linear-gradient(135deg, #9333EA, #DB2777)'
                    : '#22C55E',
                  color: successDialog.ticketType === 'membership' ? '#000' : '#fff',
                }}
              >
                {successDialog.ticketTypeLabel}
              </div>
            )}

            {/* 유저 프로필 이미지 */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                margin: '0 auto 16px',
                overflow: 'hidden',
                backgroundColor: '#333',
                border: '3px solid #22C55E',
              }}
            >
              {successDialog.user.profileImageUrl ? (
                <Image
                  src={successDialog.user.profileImageUrl}
                  alt="프로필"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    color: '#666',
                  }}
                >
                  👤
                </div>
              )}
            </div>

            {/* 유저 닉네임 */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 4,
              }}
            >
              {successDialog.user.nickName || successDialog.user.name || '사용자'}
            </div>

            {/* 유저 이름 (닉네임과 다를 경우) */}
            {successDialog.user.name && successDialog.user.nickName && successDialog.user.name !== successDialog.user.nickName && (
              <div
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: 16,
                }}
              >
                {successDialog.user.name}
              </div>
            )}

            {/* 구분선 */}
            <div
              style={{
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                margin: '16px 0',
              }}
            />

            {/* 수업 정보 */}
            {successDialog.lessonTitle && (
              <div style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 12 }}>
                {successDialog.lessonTitle}
              </div>
            )}

            {/* 입장 번호 */}
            {successDialog.rank && (
              <div
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginTop: 12,
                }}
              >
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }}>
                  입장 번호
                </div>
                <div style={{ fontSize: 32, color: '#22C55E', fontWeight: 700 }}>
                  {successDialog.rank}
                </div>
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
                padding: '14px',
                backgroundColor: '#22C55E',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 20,
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
