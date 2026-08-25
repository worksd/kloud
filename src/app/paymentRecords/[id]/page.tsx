import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";
import React from "react";
import { PaymentRecordDetailForm } from "@/app/paymentRecords/[id]/PaymentRecordDetailForm";
import { PaymentRecordDetailPcForm } from "@/app/paymentRecords/[id]/PaymentRecordDetailPcForm";
import { getLocale, translate } from "@/utils/translate";

export default async function PaymentRecordDetailPage({params, searchParams}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ appVersion?: string }>,
}) {
  const paymentId = (await params).id;
  const { appVersion = '' } = await searchParams;
  const paymentRecord = await getPaymentRecordDetail({paymentId});

  if (!('paymentId' in paymentRecord)) {
    return <div className="text-center mt-10 text-gray-500">{await translate('payment_not_found')}</div>;
  }

  const locale = await getLocale();
  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 카드 레이아웃, 그 외(앱 웹뷰/좁은 웹)는 기존 렌더.
  // 서버는 viewport를 모르므로 둘 다 SSR 렌더 후 CSS로 토글 (수업 상세/결제 페이지와 동일 패턴).
  const isWeb = appVersion === '';

  return (
    <div>
      {isWeb ? (
        <>
          <div className="hidden lg:block">
            <PaymentRecordDetailPcForm paymentRecord={paymentRecord} locale={locale}/>
          </div>
          <div className="lg:hidden">
            <PaymentRecordDetailForm paymentRecord={paymentRecord} locale={locale}/>
          </div>
        </>
      ) : (
        <PaymentRecordDetailForm paymentRecord={paymentRecord} locale={locale}/>
      )}
    </div>
  );
}
