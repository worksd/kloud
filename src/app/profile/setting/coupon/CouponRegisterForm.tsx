'use client';

import React, { useCallback, useRef, useState, useTransition } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { redeemVoucherAction } from '@/app/profile/setting/coupon/redeem.voucher.action';

const ERROR_KEY: Record<string, Parameters<typeof getLocaleString>[0]['key']> = {
  VOUCHER_NOT_FOUND:        'coupon_error_not_found',
  VOUCHER_ALREADY_REDEEMED: 'coupon_error_already_used',
  VOUCHER_EXPIRED:          'coupon_error_expired',
  VOUCHER_NOT_ACTIVE:       'coupon_error_not_active',
};

// 쿠폰 코드 — 4자리 × 3그룹 = 12자
const SEGMENTS = 3;
const SEG_LEN = 4;
const CODE_LENGTH = SEGMENTS * SEG_LEN;

// 코드 문자열을 4자리 × SEGMENTS 칸으로 분할
const toSegments = (raw?: string): string[] => {
  const cleaned = (raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
  return Array.from({ length: SEGMENTS }, (_, i) => cleaned.slice(i * SEG_LEN, (i + 1) * SEG_LEN));
};

export const CouponRegisterForm = ({ locale, initialCode }: { locale: Locale; initialCode?: string }) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [segments, setSegments] = useState<string[]>(() => toSegments(initialCode));
  const [toast, setToast] = useState<{ text: string; visible: boolean } | null>(null);
  const [, startTransition] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = segments.join('');
  const canSubmit = code.length === CODE_LENGTH;

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
        setSegments(Array(SEGMENTS).fill(''));
        inputRefs.current[0]?.focus();
      } catch {
        showToast(t('coupon_error_unknown'));
      }
    });
  }, [showToast, t]);

  // 입력 — 영숫자만, 4자 초과(붙여넣기)는 다음 칸으로 분배
  const handleChange = (idx: number, raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const next = [...segments];
    next[idx] = cleaned.slice(0, SEG_LEN);
    let rest = cleaned.slice(SEG_LEN);
    for (let i = idx + 1; i < SEGMENTS && rest.length > 0; i++) {
      next[i] = rest.slice(0, SEG_LEN);
      rest = rest.slice(SEG_LEN);
    }
    setSegments(next);
    // 현재 칸이 다 차면 다음 칸으로 포커스 이동
    if (cleaned.length >= SEG_LEN) {
      const focusIdx = Math.min(SEGMENTS - 1, idx + Math.floor(cleaned.length / SEG_LEN));
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 빈 칸에서 백스페이스 → 이전 칸으로
    if (e.key === 'Backspace' && segments[idx] === '' && idx > 0) {
      e.preventDefault();
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* 안내 */}
      <div className="px-6 pt-5 pb-4">
        <p className="text-[13px] text-[#86898C] leading-relaxed">
          {t('coupon_register_description')}
        </p>
      </div>

      {/* 코드 입력 — 4자리 × 3 */}
      <div className="px-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className="shrink-0 text-[#C5C8CC] text-[16px] font-medium select-none">–</span>
              )}
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                value={segments[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={SEG_LEN}
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoFocus={i === 0}
                placeholder="••••"
                className={`flex-1 min-w-0 h-[56px] text-center text-[22px] font-bold text-black placeholder:text-[#D5D8DC] placeholder:font-normal placeholder:text-[16px] rounded-xl outline-none font-paperlogy border transition-colors ${
                  segments[i]
                    ? 'bg-white border-black'
                    : 'bg-white border-[#E5E7EB] focus:border-black'
                }`}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* 등록 버튼 */}
      <div className="px-4 pb-6 pt-3 bg-white">
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
