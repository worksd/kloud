import React from 'react';
import Image from 'next/image';
import { api } from '@/app/api.client';
import { requireAdmin } from '@/app/admin/admin.guard';
import { AdminDetailHeader } from '@/app/admin/AdminDetailHeader';
import { AdminPaymentCancelButton } from '@/app/admin/payments/[paymentId]/AdminPaymentCancelButton';
import { paymentStatusBadge } from '@/app/admin/payment.status';
import { PaymentMethodIcon } from '@/app/components/PaymentMethodIcon';
import { Squircle } from '@/app/components/Squircle';
import { ADMIN_CONTENT_TOP_PAD } from '@/app/admin/admin.layout';

// 관리자 전용 결제 상세 — 매출 탭 결제내역에서 행을 탭하면 여기로 온다.
// 수강생용 상세(/paymentRecords/:id)는 '내 결제' 관점(환불 신청 등)이라 따로 둔다.
// 이쪽은 학원 입장에서 필요한 것만: 결제자·금액·수단·상태 + 관리자 취소.

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className={'flex items-start justify-between gap-3 py-2.5'}>
    <span className={'text-[13.5px] text-[#8B95A1] shrink-0'}>{label}</span>
    <span className={'text-[13.5px] font-medium text-[#191F28] text-right break-all'}>{children}</span>
  </div>
);

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { studioName } = await requireAdmin();
  const { paymentId } = await params;
  const record = await api.paymentRecord.get({ paymentId });

  if (!('paymentId' in record)) {
    return (
      <div className={'w-full min-h-screen overflow-x-hidden bg-[#F7F8FA]'}>
        <AdminDetailHeader title={'결제 상세'} subtitle={studioName}/>
        <p className={'px-8 text-center text-[15px] text-[#6B7280]'} style={{ paddingTop: ADMIN_CONTENT_TOP_PAD }}>
          결제 정보를 불러오지 못했어요
        </p>
      </div>
    );
  }

  const badge = paymentStatusBadge(record.status);
  const discountTotal = (record.discounts ?? []).reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const originalAmount = record.amount + discountTotal;

  return (
    <div className={'w-full min-h-screen overflow-x-hidden bg-[#F7F8FA] pb-10'}>
      <AdminDetailHeader title={'결제 상세'} subtitle={studioName}/>

      {/* 상품 + 금액 + 상태 */}
      <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] p-5'}>
        <div className={'flex items-center gap-3'}>
          <Squircle size={52} className={'bg-[#F1F3F6]'}>
            {record.productImageUrl && (
              <Image src={record.productImageUrl} alt={''} fill sizes={'52px'} className={'object-cover'}/>
            )}
          </Squircle>
          <div className={'flex-1 min-w-0'}>
            <p className={'text-[15px] font-bold text-[#191F28] leading-snug line-clamp-2'}>{record.productName}</p>
            {record.productDescription && (
              <p className={'mt-0.5 text-[12.5px] text-[#8B95A1] truncate'}>{record.productDescription}</p>
            )}
          </div>
        </div>

        <div className={'mt-4 flex items-center gap-2'}>
          <span className={`text-[11.5px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
        </div>
        <p className={'mt-1.5 text-[26px] font-bold text-[#191F28] tracking-[-0.5px] leading-none'}>
          {fmt(record.amount)}<span className={'text-[17px] font-bold'}>원</span>
        </p>
      </section>

      {/* 결제 정보 */}
      <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] px-5 py-4'}>
        <h2 className={'text-[15px] font-bold text-[#191F28] mb-1'}>결제 정보</h2>
        <div className={'divide-y divide-[#F7F8FA]'}>
          {discountTotal > 0 && (
            <>
              <Row label={'상품 금액'}>{fmt(originalAmount)}원</Row>
              {record.discounts?.map((d, i) => (
                <Row key={`${d.key}-${i}`} label={d.key || '할인'}>
                  <span className={'text-[#E55B5B]'}>-{fmt(d.amount ?? 0)}원</span>
                </Row>
              ))}
            </>
          )}
          <Row label={'결제 금액'}><span className={'font-bold'}>{fmt(record.amount)}원</span></Row>
          <Row label={'결제 수단'}>
            <span className={'inline-flex items-center gap-1.5'}>
              {record.paymentMethodLabel && (
                <PaymentMethodIcon methodType={record.methodType} label={record.paymentMethodLabel} size={20}/>
              )}
              {record.paymentMethodLabel || '-'}
            </span>
          </Row>
          {record.cardNumber && <Row label={'카드 번호'}>{record.cardNumber}</Row>}
          {record.depositor && <Row label={'입금자'}>{record.depositor}</Row>}
          <Row label={'결제 일시'}>{record.createdAt}</Row>
          {(record.confirmedAt || record.accountTransferConfirmDate) && (
            <Row label={'확인 일시'}>{record.accountTransferConfirmDate || record.confirmedAt}</Row>
          )}
          <Row label={'결제 번호'}><span className={'text-[12px] text-[#8B95A1]'}>{record.paymentId}</span></Row>
        </div>
      </section>

      {/* 취소 정보 — 취소됐거나 환불 대기일 때만 */}
      {(record.cancelledAt || record.cancelReason || record.refundAmount != null) && (
        <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] px-5 py-4'}>
          <h2 className={'text-[15px] font-bold text-[#191F28] mb-1'}>취소 정보</h2>
          <div className={'divide-y divide-[#F7F8FA]'}>
            {record.refundAmount != null && <Row label={'환불 금액'}>{fmt(record.refundAmount)}원</Row>}
            {record.cancelledAt && <Row label={'취소 일시'}>{record.cancelledAt}</Row>}
            {record.cancelReason && <Row label={'취소 사유'}>{record.cancelReason}</Row>}
            {record.refundAccountBank && (
              <Row label={'환불 계좌'}>
                {[record.refundAccountBank, record.refoundAccountNumber, record.refundDepositor].filter(Boolean).join(' · ')}
              </Row>
            )}
          </div>
        </section>
      )}

      {/* 관리자 취소 — BE가 환불 가능하다고 내려준 건에만 노출 */}
      {record.isRefundable === true && (
        <div className={'mx-4 mt-4'}>
          <AdminPaymentCancelButton paymentId={record.paymentId} productName={record.productName}/>
        </div>
      )}
    </div>
  );
}
