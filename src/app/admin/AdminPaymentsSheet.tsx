'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { GetPaymentRecordResponse, PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { getPaymentRecordsAction } from '@/app/paymentRecords/get.payment.records.action';
import { cancelPaymentAction } from '@/app/admin/cancel.payment.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

// 관리자 홈의 결제 내역 바텀시트 — 파트너 토큰의 GET /paymentRecords(스튜디오 결제) + 결제 취소.
// 키오스크 카드결제 취소는 CancelPending(환불 대기)으로 남을 수 있어 응답 status를 그대로 반영한다.

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  [PaymentRecordStatus.Completed]: { label: '결제 완료', cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  [PaymentRecordStatus.Settled]: { label: '정산 완료', cls: 'bg-[#E8F0FE] text-[#1A5CE5]' },
  [PaymentRecordStatus.Pending]: { label: '대기', cls: 'bg-[#FFF4E5] text-[#A05A00]' },
  [PaymentRecordStatus.CancelPending]: { label: '환불 대기', cls: 'bg-[#FFF4E5] text-[#A05A00]' },
  [PaymentRecordStatus.Cancelled]: { label: '취소됨', cls: 'bg-[#F3F4F6] text-[#6B7280]' },
  [PaymentRecordStatus.Failed]: { label: '실패', cls: 'bg-[#FEECEC] text-[#E55B5B]' },
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso.replace(/\./g, '-').replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function AdminPaymentsSheetContent({ locale }: { locale: Locale }) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [records, setRecords] = useState<GetPaymentRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 취소 확인 다이얼로그 — 열릴 때 fadeIn+scaleIn, 닫을 때 fadeOut 후 언마운트
  const [target, setTarget] = useState<GetPaymentRecordResponse | null>(null);
  const [dialogClosing, setDialogClosing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const cancellingRef = useRef(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // 시트가 열리면 첫 페이지 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getPaymentRecordsAction({ page: 1 });
        if (!alive) return;
        const list = 'paymentRecords' in res ? res.paymentRecords : [];
        setRecords(list);
        setHasMore(list.length > 0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getPaymentRecordsAction({ page: page + 1 });
      const next = 'paymentRecords' in res ? res.paymentRecords : [];
      if (next.length === 0) { setHasMore(false); return; }
      setRecords((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const closeDialog = () => {
    if (cancellingRef.current || dialogClosing) return;
    setDialogClosing(true);
    setTimeout(() => { setTarget(null); setDialogClosing(false); }, 200);
  };

  const submitCancel = async () => {
    if (!target || cancellingRef.current) return;
    cancellingRef.current = true;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelPaymentAction(target.paymentId);
      if (isGuinnessErrorCase(res)) {
        setCancelError(res.message || t('admin_payments_cancel_failed'));
        return;
      }
      // 응답 status 그대로 반영 — 키오스크 카드결제는 CancelPending으로 남는다
      setRecords((prev) => prev.map((r) => (r.paymentId === target.paymentId ? { ...r, ...res } : r)));
      window.KloudEvent?.showToast?.(
        res.status === PaymentRecordStatus.CancelPending
          ? t('admin_payments_cancel_pending_notice')
          : t('admin_payments_cancel_success'),
      );
      setDialogClosing(true);
      setTimeout(() => { setTarget(null); setDialogClosing(false); }, 200);
    } catch {
      setCancelError(t('admin_payments_cancel_failed'));
    } finally {
      cancellingRef.current = false;
      setCancelling(false);
    }
  };

  const cancellable = (r: GetPaymentRecordResponse) =>
    r.status === PaymentRecordStatus.Completed || r.status === PaymentRecordStatus.Settled;

  if (loading) {
    return (
      <div className={'py-14 flex items-center justify-center'}>
        <div className={'w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin'}/>
      </div>
    );
  }

  if (records.length === 0) {
    return <p className={'px-6 py-12 text-center text-[14px] text-[#8B95A1]'}>{t('admin_payments_empty')}</p>;
  }

  return (
    <>
      <div className={'flex-1 min-h-0 overflow-y-auto px-5'}>
        <ul className={'flex flex-col divide-y divide-[#F1F3F6]'}>
          {records.map((r) => {
            const badge = STATUS_STYLE[r.status] ?? { label: String(r.status ?? ''), cls: 'bg-[#F3F4F6] text-[#6B7280]' };
            return (
              <li key={r.paymentId} className={'flex items-center gap-3 py-3'}>
                <div className={'w-[42px] h-[42px] rounded-[10px] overflow-hidden bg-[#F1F3F6] shrink-0 relative'}>
                  {r.productImageUrl && (
                    <Image src={r.productImageUrl} alt={''} fill sizes={'42px'} className={'object-cover'}/>
                  )}
                </div>
                <div className={'flex-1 min-w-0'}>
                  <p className={'text-[14px] font-semibold text-black truncate'}>{r.productName}</p>
                  <p className={'mt-0.5 text-[12px] text-[#8B95A1] truncate'}>
                    {[r.depositor, r.paymentMethodLabel, formatDate(r.createdAt)].filter(Boolean).join(' · ')}
                  </p>
                  <div className={'mt-1 flex items-center gap-1.5'}>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                    <span className={'text-[13px] font-bold text-black'}>{r.amount.toLocaleString()}원</span>
                  </div>
                </div>
                {cancellable(r) && (
                  <button
                    type={'button'}
                    onClick={() => { setCancelError(null); setTarget(r); }}
                    className={'shrink-0 rounded-[10px] border border-[#E5E7EB] px-3 py-2 text-[12px] font-semibold text-[#E55B5B] active:bg-[#FEECEC] transition-colors'}
                  >
                    {t('admin_payments_cancel')}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {hasMore && (
          <button
            type={'button'}
            onClick={loadMore}
            disabled={loadingMore}
            className={'my-3 w-full h-[44px] rounded-[12px] bg-[#F2F4F6] text-[14px] font-semibold text-[#1E2124] active:bg-[#E8EAED] transition-colors disabled:opacity-60'}
          >
            {loadingMore ? '…' : t('admin_payments_load_more')}
          </button>
        )}
      </div>

      {/* 취소 확인 다이얼로그 */}
      {target && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-8 ${
            dialogClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeDialog}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[420px] bg-white rounded-[20px] p-6 animate-[scaleIn_260ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={'text-[17px] font-bold text-black'}>{t('admin_payments_cancel')}</p>
            <p className={'mt-2 text-[14px] leading-relaxed text-[#4E5968]'}>
              {t('admin_payments_cancel_confirm').replace('{name}', target.productName)}
            </p>
            <p className={'mt-1 text-[12px] leading-relaxed text-[#8B95A1]'}>{t('admin_payments_cancel_kiosk_notice')}</p>
            {cancelError && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{cancelError}</p>}
            <div className={'mt-5 flex gap-2.5'}>
              <button
                type={'button'}
                onClick={closeDialog}
                disabled={cancelling}
                className={'flex-1 h-[46px] rounded-[12px] bg-[#F2F4F6] text-[14px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {t('cancel')}
              </button>
              <button
                type={'button'}
                onClick={submitCancel}
                disabled={cancelling}
                className={'flex-[1.4] h-[46px] rounded-[12px] bg-[#E55B5B] text-[14px] font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {cancelling ? `${t('admin_payments_cancel')}…` : t('admin_payments_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
