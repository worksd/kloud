'use client'

import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { RefundReasonInput } from "./RefundReasonInput";
import { getLocaleString } from "@/app/components/locale";
import { requestRefund } from "./request.refund.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { createDialog } from "@/utils/dialog.factory";

type RefundFormActionsProps = {
  locale: Locale;
  paymentId: string;
}

export const RefundFormActions = ({ locale, paymentId }: RefundFormActionsProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefund = async () => {
    if (reason.trim().length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await requestRefund({ paymentId, reason: reason.trim() });
      
      if ('paymentId' in res) {
        // 환불 성공 - 결제내역 상세페이지로 이동
        await kloudNav.navigateMain({ route: KloudScreen.PaymentRecordDetail(paymentId) });
      } else {
        // 환불 실패 - 에러 다이얼로그 표시
        const dialog = await createDialog({ id: 'PaymentFail' });
        if (window.KloudEvent && dialog) {
          window.KloudEvent.showDialog(JSON.stringify(dialog));
        }
      }
    } catch (error) {
      console.error('Refund error:', error);
      const dialog = await createDialog({ id: 'PaymentFail' });
      if (window.KloudEvent && dialog) {
        window.KloudEvent.showDialog(JSON.stringify(dialog));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 환불 사유 */}
      <div className="px-5 py-5">
        <RefundReasonInput locale={locale} onReasonChange={setReason} />
      </div>

      {/* 환불하기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-3 bg-white border-t border-gray-200">
        <button 
          disabled={reason.trim().length === 0 || isSubmitting}
          onClick={handleRefund}
          className={`w-full h-14 rounded-[16px] flex items-center justify-center transition-colors ${
            reason.trim().length > 0 && !isSubmitting
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-[#b1b8be] text-white cursor-not-allowed'
          }`}
        >
          <span className="text-[16px] font-medium">
            {isSubmitting 
              ? (locale === 'ko' ? '처리중...' : locale === 'en' ? 'Processing...' : locale === 'jp' ? '処理中...' : '处理中...')
              : getLocaleString({locale, key: 'do_refund'})}
          </span>
        </button>
      </div>
    </>
  );
};
