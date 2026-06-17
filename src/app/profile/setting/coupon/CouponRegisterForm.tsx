'use client';

import React, { useCallback, useRef, useState, useTransition } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { redeemVoucherAction } from '@/app/profile/setting/coupon/redeem.voucher.action';
import { CouponQRScanner } from '@/app/profile/setting/coupon/CouponQRScanner';

const ERROR_KEY: Record<string, Parameters<typeof getLocaleString>[0]['key']> = {
  VOUCHER_NOT_FOUND:        'coupon_error_not_found',
  VOUCHER_ALREADY_REDEEMED: 'coupon_error_already_used',
  VOUCHER_EXPIRED:          'coupon_error_expired',
  VOUCHER_NOT_ACTIVE:       'coupon_error_not_active',
};

// QR/입력 raw 문자열에서 10자 영숫자 코드 추출
const extractCode = (raw: string): string | null => {
  const trimmed = raw.trim();
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      const q = u.searchParams.get('code') ?? u.searchParams.get('voucherCode');
      if (q) {
        const c = q.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (c.length === 10) return c;
      }
    }
  } catch { /* not a url */ }
  const m = trimmed.toUpperCase().match(/[A-Z0-9]{10}/);
  return m ? m[0] : null;
};

type Mode = 'scan' | 'manual';

export const CouponRegisterForm = ({ locale }: { locale: Locale }) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [mode, setMode] = useState<Mode>('scan');
  const [code, setCode] = useState('');
  const [toast, setToast] = useState<{ text: string; visible: boolean } | null>(null);
  const [, startTransition] = useTransition();
  const isProcessing = useRef(false);

  const showToast = useCallback((text: string) => {
    setToast({ text, visible: false });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToast((cur) => (cur ? { ...cur, visible: true } : null)));
    });
    setTimeout(() => setToast((cur) => (cur ? { ...cur, visible: false } : null)), 2700);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const submitCode = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    startTransition(async () => {
      try {
        const res = await redeemVoucherAction({ code: v });
        const r = res as { code?: string; message?: string; status?: string; passPlan?: { name?: string } };
        if (r.code && typeof r.code === 'string' && r.code.startsWith('VOUCHER_')) {
          showToast(t(ERROR_KEY[r.code] ?? 'coupon_error_unknown'));
          return;
        }
        if (r.status !== 'Used') {
          showToast(r.message ?? t('coupon_error_unknown'));
          return;
        }
        const name = r.passPlan?.name ?? '';
        showToast(t('coupon_register_success').replace('{name}', name).trim());
        setCode('');
      } catch {
        showToast(t('coupon_error_unknown'));
      }
    });
  }, [showToast, t]);

  // QR 스캔 성공 시
  const onScanned = useCallback((raw: string) => {
    if (isProcessing.current) return;
    const extracted = extractCode(raw);
    if (!extracted) {
      // 잘못된 QR — 토스트만 띄우고 카메라 유지
      showToast(t('coupon_qr_invalid'));
      return;
    }
    isProcessing.current = true;
    submitCode(extracted);
    setTimeout(() => { isProcessing.current = false; }, 2000);
  }, [showToast, submitCode, t]);

  const onChangeCode = (raw: string) => {
    setCode(raw.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  };

  const canSubmit = code.trim().length > 0;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F7F8F9]">
      {/* 안내 */}
      <div className="px-6 pt-5 pb-4">
        <p className="text-[13px] text-[#86898C] leading-relaxed">
          {t('coupon_register_description')}
        </p>
      </div>

      {mode === 'scan' ? (
        /* ───── 스캔 모드 (기본) ───── */
        <>
          <div className="px-4">
            <CouponQRScanner onSuccess={onScanned} />
          </div>

          {/* 번호로 입력하기 — 스캐너 아래 보조 액션 */}
          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className="w-full h-[48px] rounded-[14px] bg-white text-black border border-[#E5E7EB] active:bg-[#F0F0F0] transition-colors text-[14px] font-bold"
            >
              {t('coupon_enter_code')}
            </button>
          </div>

          <div className="flex-1"/>
        </>
      ) : (
        /* ───── 수동 입력 모드 ───── */
        <>
          <div className="px-4">
            <div className="bg-white rounded-2xl px-4 py-3">
              <input
                type="text"
                value={code}
                onChange={(e) => onChangeCode(e.target.value)}
                placeholder={t('coupon_register_placeholder')}
                maxLength={10}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                className="w-full text-[15px] font-medium text-black placeholder:text-[#BFC2C5] bg-transparent outline-none p-0 border-0 tracking-[0.08em] font-paperlogy"
              />
            </div>

            <button
              type="button"
              onClick={() => setMode('scan')}
              className="mt-3 w-full flex items-center justify-center gap-2 h-[48px] rounded-[14px] bg-white text-black border border-[#E5E7EB] active:bg-[#F0F0F0] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" rx="1" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" rx="1" strokeLinejoin="round"/>
                <path d="M14 14h3v3M21 14v3M14 18v3h3M21 21h-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px] font-bold">{t('coupon_scan_qr')}</span>
            </button>
          </div>

          <div className="flex-1"/>

          {/* 등록 버튼 — 수동 모드에서만 노출 */}
          <div className="px-4 pb-6 pt-3 bg-[#F7F8F9]">
            <button
              type="button"
              onClick={() => submitCode(code)}
              disabled={!canSubmit}
              className={`w-full h-[52px] rounded-[14px] text-[15px] font-bold transition-all ${
                canSubmit
                  ? 'bg-black text-white active:scale-[0.98]'
                  : 'bg-[#E5E7EB] text-[#BFC2C5]'
              }`}
            >
              {t('coupon_register_button')}
            </button>
          </div>
        </>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed left-1/2 bottom-28 z-[1100] max-w-[90%] rounded-[12px] bg-black/85 px-4 py-3 text-center text-[13px] text-white whitespace-pre-line leading-5 font-paperlogy transition-all duration-300 ease-out ${
            toast.visible
              ? 'opacity-100 -translate-x-1/2 translate-y-0'
              : 'opacity-0 -translate-x-1/2 translate-y-3'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};
