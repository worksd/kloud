import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { useState } from "react";
import { BankCode, BankOrCardIcon } from "@/app/components/Bank";

/** 표시 라벨 */
const BANK_LABELS: Record<BankCode, string> = {
  kb: '국민은행',
  shinhan: '신한은행',
  hana: '하나은행',
  woori: '우리은행',
  ibk: '기업은행',
  nonghyup: '농협은행',
  kakaobank: '카카오뱅크',
  kbank: '케이뱅크',
  toss: '토스뱅크',
  sc: 'SC제일은행',
  citi: '씨티은행',
  kdb: '한국산업은행',
  post: '우체국',
  saemaul: '새마을금고',
  suhyup: '수협은행',
  shinhyup: '신협은행',
  bnk: 'BNK (부산/경남)',
  sbi: 'SBI저축은행',
  im: 'IM뱅크',
  rado: '광주/전북은행',
  bc: 'BC카드',
  hyundai: '현대카드',
  samsung: '삼성카드',
  lotte: '롯데카드',
} as const;

/** 필요한 키만 노출 */
const BANK_KEYS: BankCode[] = [
  'kb', 'shinhan', 'hana', 'woori', 'ibk', 'nonghyup',
  'kakaobank', 'kbank', 'toss',
  'sc', 'citi', 'kdb', 'post', 'saemaul', 'suhyup', 'shinhyup', 'bnk',
  'rado', 'sbi', 'im',
];

type BankSelectBottomSheetProps = {
  open: boolean;
  selected?: BankCode;
  onSelect: (code: BankCode, label: string) => void;
  onClose: () => void;
  title?: string;
};

/** 3열 그리드 바텀시트 */
export function BankSelectBottomSheet({
                                        open,
                                        selected,
                                        onSelect,
                                        onClose,
                                        title = '은행 선택',
                                      }: BankSelectBottomSheetProps) {
  return (
    <CommonBottomSheet open={open} onCloseAction={onClose}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-bold text-black">{title}</div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="p-2 -m-2 text-gray-500"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3열 그리드 리스트 */}
      <div className="max-h-[60dvh] overflow-y-auto px-4 pb-[16px]">
        <div className="grid grid-cols-3 gap-3">
          {BANK_KEYS.map((code) => {
            const isSelected = selected === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelect(code, BANK_LABELS[code])}
                className={[
                  'relative flex flex-col items-center justify-center',
                  'rounded-xl border pb-3 text-center',
                  'transition focus:outline-none focus:ring-2 focus:ring-gray-300',
                  isSelected ? 'bg-gray-50 border-black' : 'bg-white border-gray-200 hover:bg-gray-50',
                ].join(' ')}
              >
                {/* 체크 표시 */}
                {isSelected && (
                  <span
                    className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
                )}

                {/* 아이콘 */}
                <div className="flex w-20 h-20 shrink-0 items-center justify-center">
                  <BankOrCardIcon name={code} scale={100}/>
                </div>

                {/* 라벨 (두 줄 방지) */}
                <span className="text-[13px] text-black leading-tight line-clamp-1">
    {BANK_LABELS[code]}
  </span>
              </button>

            );
          })}
        </div>
      </div>
    </CommonBottomSheet>
  );
}