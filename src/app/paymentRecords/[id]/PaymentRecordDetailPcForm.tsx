// PC 웹 전용 결제내역 상세 — 모바일(PaymentRecordDetailForm)의 회색 스페이서 구분 대신
// 중앙 정렬 카드 섹션들로 정리한 데스크톱 레이아웃. 분기는 page.tsx에서 appVersion + viewport(lg)로.
// 판정/라벨 로직은 모바일 폼과 동일하게 유지한다 — 여기서 값 계산 규칙을 바꾸지 말 것.

import {NavigateClickWrapper} from "@/utils/NavigateClickWrapper";
import {SellerInformation} from "@/app/lessons/[id]/payment/SellerInformation";
import {RefundInformation} from "@/app/lessons/[id]/payment/RefundInformation";
import React from "react";
import {GetPaymentRecordResponse, PaymentRecordStatus} from "@/app/endpoint/payment.record.endpoint";
import {translate} from "@/utils/translate";
import {PaymentStatusBadge} from "@/app/paymentRecords/PaymentRecordItem";
import {BankOrCardIcon} from "@/app/components/Bank";
import {PaymentMethodLabel} from "@/app/components/PaymentMethodLabel";
import {Locale} from "@/shared/StringResource";
import Image from "next/image";
import GrayRightArrow from "../../../../public/assets/gray_right_arrow.svg";
import PassPlanIcon from "../../../../public/assets/ic_pass_plan.svg";
import {formatAccountNumber} from "@/utils/format.account";
import {KloudScreen} from "@/shared/kloud.screen";

const formatCardNumber = (cardNumber?: string | null) => {
  if (!cardNumber) return '';
  const chars = cardNumber.replace(/[\s-]/g, '');
  return chars.replace(/(.{4})(?=.)/g, '$1-');
};

// 라벨 좌 / 값 우 한 줄
const Row = ({label, children, bold = false}: { label: string; children: React.ReactNode; bold?: boolean }) => (
  <div className="flex items-center justify-between gap-4">
    <span className={`text-[14px] ${bold ? 'font-bold text-black' : 'font-medium text-[#6d7882]'}`}>{label}</span>
    <span className={`text-[14px] text-right ${bold ? 'font-bold text-black text-[16px]' : 'font-medium text-[#191f28]'}`}>{children}</span>
  </div>
);

const Card = ({title, children}: { title?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
    {title && <h2 className="text-[16px] font-bold text-black mb-5">{title}</h2>}
    {children}
  </section>
);

export const PaymentRecordDetailPcForm = async ({paymentRecord, locale}: {
  paymentRecord: GetPaymentRecordResponse,
  locale: Locale
}) => {
  // ↓ 판정 로직은 모바일 폼(PaymentRecordDetailForm)과 동일
  const parts = paymentRecord.paymentId.split('-');
  const displayPaymentId = parts[parts.length - 1];
  const isPassPlan = paymentRecord.paymentId.startsWith('LP');
  const isLessonTicket = paymentRecord.paymentId.startsWith('LT');
  const isMembership = paymentRecord.paymentId.startsWith('SM');
  const isBundle = paymentRecord.paymentId.startsWith('BD');
  const isPracticeRoom = paymentRecord.paymentId.startsWith('PR');
  // 아는 상품 종류(BD/PR/LP/LT)만 제목을 만든다. 그 외(LGT 정기, SM 멤버십 등)는 null —
  // 예전 else 폴백('패스권 정보')이 LGT 결제에 잘못 붙어서, 매칭 안 되면 상품 정보 영역을 통째로 숨긴다.
  const informationTitle = isBundle
      ? await translate('promotion_information')
      : isPracticeRoom
          ? await translate('practice_room_information')
          : isPassPlan
              ? await translate('pass_plan_information')
              : isLessonTicket
                  ? await translate('lesson_ticket_information')
                  : null;
  const amountLabel = isBundle
      ? await translate('promotion_price')
      : isPassPlan
          ? await translate('pass_plan_price')
          : isLessonTicket
              ? await translate('lesson_price')
              : isMembership
                  ? await translate('membership_price')
                  : await translate('payment_amount');
  const totalDiscountAmount = paymentRecord.discounts?.reduce((sum, discount) => sum + discount.amount, 0) ?? 0;
  const originalAmount = paymentRecord.amount + totalDiscountAmount;
  const wonText = await translate('won');
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const isCancelled = paymentRecord.status === PaymentRecordStatus.Cancelled || paymentRecord.status === PaymentRecordStatus.CancelPending;

  return (
    <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
      <div className="mx-auto w-full max-w-[680px] px-8 flex flex-col gap-4">

        {/* 헤더 — 다른 섹션들과 같은 카드로 통일. 금액이 히어로(영수증 첫인상), 배지/일시는 위, 결제번호는 아래 */}
        <header className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <PaymentStatusBadge status={paymentRecord.status} locale={locale}/>
            {paymentRecord.createdAt && (
              <span className="text-[12px] text-[#8A949E] font-medium shrink-0">{paymentRecord.createdAt}</span>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[32px] font-bold text-black leading-none tracking-tight">{fmt(paymentRecord.amount)}</span>
            <span className="text-[17px] text-[#6d7882]">{wonText}</span>
          </div>
        </header>

        {/* 상품 정보 — 아는 상품 종류일 때만 노출 */}
        {informationTitle != null && (
        <Card title={informationTitle}>
          {isBundle ? (
            <div className="flex flex-col">
              <p className="text-[14px] font-medium text-black mb-3">{paymentRecord.productName}</p>
              {paymentRecord.tickets && paymentRecord.tickets.length > 0 && (
                <div className="flex flex-col gap-2">
                  {paymentRecord.tickets.map((t) => (
                    <NavigateClickWrapper key={t.id} method="push" route={KloudScreen.TicketDetail(t.id, false)}>
                      <div className="flex items-center gap-3 p-3 bg-[#F7F8F9] rounded-xl hover:bg-[#F1F3F6] cursor-pointer transition-colors">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F1F3F6] shrink-0">
                          {t.lesson.thumbnailUrl && (
                            <Image src={t.lesson.thumbnailUrl} alt={t.lesson.title} fill sizes="48px" className="object-cover"/>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-[14px] font-medium text-black truncate">{t.lesson.title}</span>
                          {t.lesson.date && <span className="text-[12px] text-[#6d7882]">{t.lesson.date}</span>}
                        </div>
                        <GrayRightArrow className="w-5 h-5 text-[#b1b8be] shrink-0"/>
                      </div>
                    </NavigateClickWrapper>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavigateClickWrapper method={'push'} route={paymentRecord.productRoute || ''}>
              <div className="flex items-center justify-between -m-2 p-2 rounded-xl hover:bg-[#F7F8F9] cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  {isLessonTicket ? (
                    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      {paymentRecord.productImageUrl ? (
                        <Image
                          src={paymentRecord.productImageUrl}
                          alt={paymentRecord.productName}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F1F3F6] flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#C5C8CB" strokeWidth="1.5"/>
                            <circle cx="8.5" cy="10.5" r="1.5" stroke="#C5C8CB" strokeWidth="1.5"/>
                            <path d="M3 16l4.793-4.793a1 1 0 011.414 0L13 15l2.793-2.793a1 1 0 011.414 0L21 16"
                                  stroke="#C5C8CB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex-shrink-0">
                      <PassPlanIcon className="w-full h-full text-[#b1b8be]"/>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-black">{paymentRecord.productName}</p>
                    {paymentRecord.productDescription && (
                      <p className="text-[12px] text-[#6d7882]">{paymentRecord.productDescription}</p>
                    )}
                  </div>
                </div>
                <GrayRightArrow className="w-6 h-6 text-[#b1b8be]"/>
              </div>
            </NavigateClickWrapper>
          )}
        </Card>
        )}

        {/* 결제 정보 */}
        <Card title={await translate('payment_information_title')}>
          <div className="flex flex-col gap-4">
            <Row label={amountLabel}>{fmt(originalAmount)}{wonText}</Row>
            {paymentRecord.discounts?.map((discount, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-medium text-black">{discount.key}</span>
                <span className="text-[14px] font-medium text-[#e55b5b]">-{fmt(discount.amount)}{wonText}</span>
              </div>
            ))}
            <Row label={await translate('total_amount')} bold>{fmt(paymentRecord.amount)}{wonText}</Row>

            <div className="h-px bg-[#eef0f2]"/>

            {/* 결제번호 — 헤더에서 내려옴(라벨 중복 노출이 어색해 메타 행으로 통합) */}
            <Row label={await translate('payment_id')}>{displayPaymentId}</Row>
            <Row label={await translate('payment_datetime')}>{paymentRecord.createdAt}</Row>
            {(paymentRecord.confirmedAt || paymentRecord.accountTransferConfirmDate) && (
              <Row label={await translate('confirmation_datetime')}>
                {paymentRecord.accountTransferConfirmDate || paymentRecord.confirmedAt}
              </Row>
            )}
            <Row label={await translate('payment_method')}>
              <PaymentMethodLabel paymentMethod={paymentRecord.paymentMethodLabel}/>
            </Row>
            {paymentRecord.methodType === 'credit' ? (
              <Row label={await translate('card_information')}>{formatCardNumber(paymentRecord.cardNumber)}</Row>
            ) : paymentRecord.depositor && (
              <Row label={await translate('depositor_name')}>{paymentRecord.depositor}</Row>
            )}
            {paymentRecord.methodType === 'account_transfer' && paymentRecord.studio?.bank && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[14px] font-medium text-[#6d7882]">{await translate('deposit_account_information')}</span>
                  <div className="flex items-center gap-1">
                    <BankOrCardIcon name={paymentRecord.studio.bank} size={20}/>
                    <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.studio.bank}</span>
                    <span className="text-[14px] font-medium text-[#191f28]">{formatAccountNumber(paymentRecord.studio.accountNumber, paymentRecord.studio.bank)}</span>
                  </div>
                </div>
                {paymentRecord.studio.depositor && (
                  <Row label={await translate('account_holder')}>{paymentRecord.studio.depositor}</Row>
                )}
              </>
            )}
          </div>
        </Card>

        {/* 취소 정보 — 환불 대기/취소일 때만 */}
        {isCancelled && (
          <Card title={await translate('cancellation_information')}>
            <div className="flex flex-col gap-4">
              <Row label={await translate('refund_amount')} bold>
                {fmt(paymentRecord.refundAmount ?? paymentRecord.amount)}{wonText}
              </Row>
              <div className="h-px bg-[#eef0f2]"/>
              {paymentRecord.cancelledAt && (
                <Row label={await translate('cancellation_datetime')}>{paymentRecord.cancelledAt}</Row>
              )}
              {paymentRecord.cancelReason && (
                <Row label={await translate('cancellation_reason')}>{paymentRecord.cancelReason}</Row>
              )}
              {paymentRecord.refundAccountBank && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[14px] font-medium text-[#6d7882]">{await translate('refund_account')}</span>
                  <div className="flex items-center gap-1">
                    <BankOrCardIcon name={paymentRecord.refundAccountBank} size={20}/>
                    <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.refundAccountBank}</span>
                    <span className="text-[14px] font-medium text-[#191f28]">{paymentRecord.refoundAccountNumber}</span>
                  </div>
                </div>
              )}
            </div>
            {paymentRecord.methodType === 'credit' ? (
              <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                {await translate('refund_processing_time_note')}
              </p>
            ) : (paymentRecord.methodType === 'admin' || paymentRecord.methodType === 'account_transfer') ? (
              <p className="text-[12px] font-medium text-[#6d7882] mt-4">
                {await translate('refund_notice_studio')}
              </p>
            ) : null}
          </Card>
        )}

        {/* 판매자 정보 및 환불안내 */}
        <Card title={await translate('seller_information')}>
          <div className="space-y-6">
            {paymentRecord.studio && <SellerInformation studio={paymentRecord.studio} locale={locale}/>}
            <RefundInformation locale={locale} paymentId={paymentRecord.paymentId} isRefundable={paymentRecord.isRefundable}/>
          </div>
        </Card>
      </div>
    </div>
  );
}
