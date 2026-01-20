'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import QRScanner from '@/app/components/QRScanner';
import { toUsedAction } from '@/app/qrs/to.used.action';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { kloudNav } from '@/app/lib/kloudNav';

type LessonInfo = GetLessonResponse;

export default function QRPageContent({ lesson }: { lesson?: LessonInfo }) {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const isScanning = useRef(false);
  const lastScannedTime = useRef<number | null>(null);
  const debounceDelay = useRef(2000);
  const scanned = useRef<Set<string>>(new Set([]));

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
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

      // 이미 처리 완료된 QR은 스킵
      if (scanned.current.has(decodedText)) {
        console.log('[QR] 이미 처리된 QR');
        return;
      }

      // 현재 API 호출 중이면 스킵
      if (isScanning.current) {
        console.log('[QR] 이미 API 호출 중');
        return;
      }

      const params = parseTicketParams(decodedText);
      console.log('[QR] 파라미터 파싱:', params);

      if (!params) {
        showToast('error', '올바르지 않은 QR 코드입니다.');
        return;
      }

      const { ticketId, expiredAt } = params;

      // 로딩 시작
      isScanning.current = true;
      setLoading(true);
      console.log('[QR] 로딩 시작, API 호출:', { ticketId, expiredAt, lessonId });

      try {
        const result = await toUsedAction({
          ticketId,
          expiredAt,
          lessonId: lessonId ? Number(lessonId) : undefined,
        });

        console.log('[QR] API 응답:', result);

        if ('message' in result) {
          // 에러 응답
          showToast('error', result.message || 'QR 출석에 실패했습니다.');
        } else {
          // 성공 응답
          scanned.current.add(decodedText);
          showToast('success', '정상적으로 QR 출석이 되었습니다.');
        }
      } catch (error) {
        console.error('[QR] API 에러:', error);
        showToast('error', '네트워크 오류가 발생했습니다.');
      } finally {
        isScanning.current = false;
        setLoading(false);
        console.log('[QR] 로딩 종료');
      }
    },
    [parseTicketParams, lessonId]
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
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <QRScanner onSuccess={onSuccess} onError={onError} onBack={handleBack} isProcessing={loading} />

      {/* 레슨 정보 카드 */}
      {lesson && (
        <div
          style={{
            position: 'fixed',
            top: 76,
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

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: lesson ? 160 : 80,
            left: 12,
            right: 12,
            zIndex: 1001,
            backgroundColor: toastMessage.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: '14px 16px',
            color: 'white',
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
}
