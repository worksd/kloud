'use client';

import React, {useState} from 'react';
import BackArrowIcon from '../../../public/assets/ic_back_arrow.svg';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';

type AdminKioskPaymentItem = {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  price: number;
};

type AdminKioskPaymentFormProps = {
  item: AdminKioskPaymentItem;
  locale: Locale;
  loading?: boolean;
  onBack: () => void;
  onPay: (amount: number, method: 'card' | 'onsite') => void;
};

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'];

// admin(상담실) 결제 폼 — 고른 상품 정보를 보여주고, 금액을 직원이 편집한 뒤
// '결제하기'로 requestKisPayment(단말 매입)를 호출한다.
export const AdminKioskPaymentForm = ({item, locale, loading, onBack, onPay}: AdminKioskPaymentFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  // 금액은 숫자 문자열(원 단위)로 관리 — 상품가로 초기화, 직원이 키패드로 수정
  const [amountStr, setAmountStr] = useState<string>(String(Math.max(0, Math.round(item.price))));
  const [showOnsiteConfirm, setShowOnsiteConfirm] = useState(false);
  const amount = Number(amountStr || '0');

  const handleKey = (key: string) => {
    if (loading) return;
    if (key === '←') {
      setAmountStr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
    } else if (key === '00') {
      setAmountStr((prev) => (prev === '0' || prev === '' ? '0' : (prev.length < 12 ? prev + '00' : prev)));
    } else {
      setAmountStr((prev) => {
        const next = prev === '0' || prev === '' ? key : prev + key;
        return next.length <= 12 ? next : prev;
      });
    }
  };

  const canPay = !loading && amount > 0;

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div className="h-[70px] px-[32px] flex items-center shrink-0 relative">
        <button
          onClick={onBack}
          className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity z-10"
        >
          <BackArrowIcon className="w-6 h-6"/>
        </button>
        <p className="absolute inset-0 flex items-center justify-center text-black text-[20px] font-bold pointer-events-none">
          {t('kiosk_admin_payment_title')}
        </p>
      </div>

      <div className="flex-1 min-h-0 flex items-stretch gap-[48px] px-[56px] pt-[8px] pb-[40px]">
        {/* 좌측 — 상품 정보 + 금액 + 결제 버튼 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{maxWidth: 600}}>
          {/* 상품 카드 */}
          <div className="flex items-center gap-[20px] bg-gray-50 rounded-[24px] p-[24px]">
            <div className="w-[88px] h-[88px] rounded-[16px] overflow-hidden bg-gray-200 shrink-0">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kioskImageSrc(item.thumbnailUrl, 256)} alt="" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[32px]">🕺</div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
              <p className="text-black text-[24px] font-bold leading-tight truncate">{item.title || '-'}</p>
              {item.subtitle && <p className="text-gray-500 text-[16px] truncate">{item.subtitle}</p>}
            </div>
          </div>

          {/* 결제 금액 (편집 가능) */}
          <div className="mt-[28px]">
            <p className="text-gray-400 text-[18px] mb-[10px]">{t('payment_amount')}</p>
            <div className="flex items-baseline justify-end bg-[#F4F6F8] rounded-[18px] px-[24px]" style={{height: 96}}>
              <span className="text-black font-bold tabular-nums" style={{fontSize: 48}}>{amount.toLocaleString('ko-KR')}</span>
              <span className="text-[#86898C] font-medium ml-[8px] text-[24px]">{t('won')}</span>
            </div>
          </div>

          {/* 결제 버튼 — 카드결제 / 현장결제 */}
          <div className="mt-[28px] flex gap-[14px]">
            <button
              onClick={() => canPay && onPay(amount, 'card')}
              disabled={!canPay}
              className={`flex-1 rounded-[18px] flex items-center justify-center active:scale-[0.98] transition-all ${canPay ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'}`}
              style={{height: 84}}
            >
              {loading ? (
                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <span className="text-white text-[26px] font-bold">{t('kiosk_admin_pay_card')}</span>
              )}
            </button>
            <button
              onClick={() => { if (canPay) setShowOnsiteConfirm(true); }}
              disabled={!canPay}
              className={`flex-1 rounded-[18px] flex items-center justify-center border-2 active:scale-[0.98] transition-all ${canPay ? 'border-[#1E2124] bg-white' : 'border-[#E6E8EA] bg-white'}`}
              style={{height: 84}}
            >
              <span className={`text-[26px] font-bold ${canPay ? 'text-[#1E2124]' : 'text-[#CDD1D5]'}`}>{t('kiosk_admin_pay_onsite')}</span>
            </button>
          </div>
        </div>

        {/* 우측 — 금액 편집 키패드 */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="w-full grid grid-cols-3 gap-[14px]" style={{maxWidth: 520}}>
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                disabled={loading}
                className="rounded-[18px] aspect-[5/3] flex items-center justify-center bg-[#F4F6F8] active:bg-[#E6E9EC] transition-colors disabled:opacity-50"
              >
                <span className="text-[#1E2124] font-bold text-[32px]">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현장결제 확인 다이얼로그 — 카드단말 없이 확인만 받고 즉시 처리 */}
      {showOnsiteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_180ms_ease-out]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOnsiteConfirm(false)}/>
          <div className="relative bg-white rounded-[24px] w-full max-w-[480px] p-[32px] flex flex-col animate-[scaleIn_180ms_ease-out]">
            <p className="text-black text-[26px] font-bold text-center">{t('kiosk_admin_onsite_confirm')}</p>
            <p className="text-gray-500 text-[20px] text-center mt-[10px]">
              {amount.toLocaleString('ko-KR')} {t('won')}
            </p>
            <div className="mt-[28px] flex gap-[12px]">
              <button
                onClick={() => setShowOnsiteConfirm(false)}
                className="flex-1 rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
                style={{height: 68}}
              >
                <span className="text-[#1E2124] text-[22px] font-bold">{t('kiosk_cancel')}</span>
              </button>
              <button
                onClick={() => { setShowOnsiteConfirm(false); onPay(amount, 'onsite'); }}
                className="flex-1 rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
                style={{height: 68}}
              >
                <span className="text-white text-[22px] font-bold">{t('kiosk_confirm')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
