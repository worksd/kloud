'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';
import { cancelPaymentAction } from '@/app/admin/cancel.payment.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

/**
 * 관리자 결제 취소 — DELETE /paymentRecords/:id/cancel (requester='ADMIN').
 * 키오스크 카드결제는 즉시 취소되지 않고 CancelPending(환불 대기)으로 남을 수 있어 안내를 다르게 띄운다.
 * 성공하면 router.refresh()로 상세를 다시 그려 바뀐 상태가 반영되게 한다.
 */
export function AdminPaymentCancelButton({ paymentId, productName }: { paymentId: string; productName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (submittingRef.current || closing) return;
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  };

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await cancelPaymentAction(paymentId);
      if (isGuinnessErrorCase(res)) {
        setError(res.message || '결제 취소에 실패했어요');
        return;
      }
      window.KloudEvent?.showToast?.(
        res.status === PaymentRecordStatus.CancelPending
          ? '환불 요청이 접수됐어요. 처리까지 시간이 걸릴 수 있어요'
          : '결제가 취소됐어요',
      );
      submittingRef.current = false;
      setOpen(false);
      setClosing(false);
      router.refresh();
    } catch {
      setError('결제 취소에 실패했어요');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type={'button'}
        onClick={() => { setError(null); setOpen(true); }}
        className={'w-full h-[52px] rounded-[14px] bg-[#FEECEC] text-[15px] font-bold text-[#E55B5B] active:scale-[0.98] transition-transform'}
      >
        결제 취소
      </button>

      {open && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-8 ${
            closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={close}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[420px] bg-white rounded-[20px] p-6 animate-[scaleIn_260ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={'text-[17px] font-bold text-black'}>결제 취소</p>
            <p className={'mt-2 text-[14px] leading-relaxed text-[#4E5968]'}>
              {`'${productName}' 결제를 취소할까요?`}
            </p>
            <p className={'mt-1 text-[12px] leading-relaxed text-[#8B95A1]'}>
              키오스크 카드결제는 바로 취소되지 않고 환불 대기로 남을 수 있어요.
            </p>
            {error && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{error}</p>}
            <div className={'mt-5 flex gap-2.5'}>
              <button
                type={'button'}
                onClick={close}
                disabled={submitting}
                className={'flex-1 h-[46px] rounded-[12px] bg-[#F2F4F6] text-[14px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                닫기
              </button>
              <button
                type={'button'}
                onClick={submit}
                disabled={submitting}
                className={'flex-[1.4] h-[46px] rounded-[12px] bg-[#E55B5B] text-[14px] font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {submitting ? '결제 취소…' : '결제 취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
