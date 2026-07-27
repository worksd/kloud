'use client';

import React, {useState} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';
import {KioskPhoneInputForm} from '@/app/kiosk/KioskPhoneInputForm';
import {sendPaymentReceiptAction} from '@/app/kiosk/kiosk.actions';
import {isGuinnessErrorCase} from '@/app/guinnessErrorCase';

type AdminKioskPaymentSuccessProps = {
  title: string;
  thumbnailUrl?: string;
  amount: number;
  locale: Locale;
  /** 전자영수증 발송 대상 결제 ID. 없으면 발급 불가. */
  paymentId?: string | null;
  /** 이미 알고 있는 수신자 번호(숫자만). 있으면 바로 발송, 없으면 입력 플로우로. */
  defaultPhone?: string;
  defaultCountryCode?: string;
  onHome: () => void;
};

type ReceiptStatus = 'idle' | 'sending' | 'sent' | 'error';

// admin(상담실) 결제 완료 화면 — 무인 키오스크 성공 오버레이와 별개.
// 직원이 결제한 실금액을 그대로 보여주고, 전자영수증(알림톡) 발송 버튼을 제공한다.
export const AdminKioskPaymentSuccess = ({
  title, thumbnailUrl, amount, locale, paymentId, defaultPhone, defaultCountryCode, onHome,
}: AdminKioskPaymentSuccessProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  const [phoneInputOpen, setPhoneInputOpen] = useState(false);
  const [status, setStatus] = useState<ReceiptStatus>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // 전자영수증(알림톡) 발송 — 성공은 '발송 요청 접수' 기준.
  const sendReceipt = async (receiverPhone: string, countryCode: string) => {
    if (!paymentId || !receiverPhone) return;
    setStatus('sending');
    try {
      const res = await sendPaymentReceiptAction({paymentId, phone: receiverPhone, countryCode});
      if (isGuinnessErrorCase(res)) {
        setStatus('error');
        showToast(res.message ?? t('kiosk_admin_receipt_fail'));
        return;
      }
      setStatus('sent');
      showToast(t('kiosk_admin_receipt_sent'));
    } catch {
      setStatus('error');
      showToast(t('kiosk_admin_receipt_fail'));
    }
  };

  const handleIssueClick = () => {
    if (status === 'sending') return;
    if (!paymentId) { showToast(t('kiosk_admin_receipt_unavailable')); return; }
    const known = (defaultPhone ?? '').trim();
    if (known) {
      sendReceipt(known, defaultCountryCode ?? '82');
    } else {
      // 번호를 들고 있지 않으면 추가 입력 플로우로
      setPhoneInputOpen(true);
    }
  };

  // 번호 미보유 시 — 수신자 번호 입력 오버레이
  if (phoneInputOpen) {
    return (
      <div className="fixed inset-0 z-40 bg-white">
        <KioskPhoneInputForm
          locale={locale}
          variant="admin"
          onBack={() => setPhoneInputOpen(false)}
          onHome={onHome}
          onSearchByEmail={() => { /* 영수증 발송엔 이메일 검색 미사용 */ }}
          loading={status === 'sending'}
          onNext={(inputPhone, cc) => { setPhoneInputOpen(false); sendReceipt(inputPhone, cc || '82'); }}
        />
      </div>
    );
  }

  const issueLabel = status === 'sending'
    ? t('kiosk_admin_receipt_sending')
    : status === 'sent'
      ? t('kiosk_admin_receipt_done_label')
      : t('kiosk_admin_issue_receipt');

  return (
    <div className="fixed inset-0 z-30 bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-[56px]">
        <div className="w-[96px] h-[96px] rounded-full bg-[#3CC0AF] flex items-center justify-center mb-[28px]">
          <svg viewBox="0 0 24 24" fill="none" style={{width: 44, height: 44}}>
            <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="text-black text-[38px] font-bold tracking-[-1px] text-center">
          {t('kiosk_admin_payment_done')}
        </p>

        <div className="w-full max-w-[560px] mt-[36px] bg-gray-50 rounded-[20px] px-[28px] py-[24px] flex items-center gap-[18px]">
          <div className="w-[72px] h-[72px] rounded-[14px] overflow-hidden bg-gray-200 shrink-0">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kioskImageSrc(thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[28px]">🕺</div>
            )}
          </div>
          <span className="flex-1 min-w-0 text-black text-[22px] font-bold leading-snug line-clamp-2">{title || '-'}</span>
          <span className="shrink-0 flex items-baseline gap-[6px]">
            <span className="text-black text-[30px] font-bold">{amount.toLocaleString('ko-KR')}</span>
            <span className="text-[#86898C] text-[18px]">{t('won')}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0 px-[56px] pb-[40px] flex flex-col gap-[12px]">
        {/* 전자영수증 발급 — 번호 보유 시 바로 발송, 미보유 시 입력 플로우 */}
        <button
          onClick={handleIssueClick}
          disabled={status === 'sending'}
          className="w-full rounded-[16px] border-2 border-[#1E2124] bg-white flex items-center justify-center active:scale-[0.98] transition-transform disabled:opacity-50"
          style={{height: 76}}
        >
          <span className="text-[#1E2124] text-[24px] font-bold">{issueLabel}</span>
        </button>
        <button
          onClick={onHome}
          className="w-full rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.98] transition-transform"
          style={{height: 76}}
        >
          <span className="text-white text-[24px] font-bold">{t('kiosk_to_home')}</span>
        </button>
      </div>

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[140px] px-[26px] py-[14px] rounded-[12px] bg-black/85">
          <span className="text-white text-[18px] font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
};
