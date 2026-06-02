'use client';

import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { useEffect, useState } from "react";
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
  bnk: 'BNK은행',
  sbi: 'SBI저축은행',
  im: 'IM뱅크',
  rado: '광주/전북은행',
  bc: 'BC카드',
  hyundai: '현대카드',
  samsung: '삼성카드',
  lotte: '롯데카드',
} as const;

/** 노출 순서 — 주요 시중 → 인터넷 → 그 외 */
const BANK_KEYS: BankCode[] = [
  'kb', 'shinhan', 'hana', 'woori', 'ibk', 'nonghyup',
  'kakaobank', 'kbank', 'toss',
  'sc', 'citi', 'kdb', 'post', 'saemaul', 'suhyup', 'shinhyup', 'bnk',
  'rado', 'sbi', 'im',
];

type BankSelectBottomSheetProps = {
  open: boolean;
  selected?: BankCode | 'other';
  /** 'other'로 선택돼 있을 때 현재 저장된 라벨 — 직접 입력 모드 진입 시 pre-fill에 사용 */
  selectedLabel?: string;
  onSelect: (code: BankCode | 'other', label: string) => void;
  onClose: () => void;
  title?: string;
};

// 한 셀 — 그리드 안에서 동일한 시각 톤으로 통일
const BankCell = ({
  isSelected,
  onClick,
  icon,
  name,
}: {
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  name: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-colors ${
      isSelected ? 'bg-black/5 ring-[1.5px] ring-inset ring-black' : 'bg-[#F7F8F9] active:bg-[#EFEFEF]'
    }`}
  >
    {isSelected && (
      <span className="absolute right-1 top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-white">
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    )}
    <div className="flex w-9 h-9 items-center justify-center">{icon}</div>
    <span className="text-[12px] text-black leading-tight line-clamp-2 px-1 break-keep text-center">
      {name}
    </span>
  </button>
);

const OtherBankIcon = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
    <rect x="4" y="8" width="24" height="16" rx="3" stroke="#BFC2C5" strokeWidth="1.8"/>
    <circle cx="10" cy="16" r="1.5" fill="#BFC2C5"/>
    <circle cx="16" cy="16" r="1.5" fill="#BFC2C5"/>
    <circle cx="22" cy="16" r="1.5" fill="#BFC2C5"/>
  </svg>
);

/** 3열 그리드 바텀시트 — '기타' 선택 시 직접 입력 모드로 전환 */
export function BankSelectBottomSheet({
                                        open,
                                        selected,
                                        selectedLabel,
                                        onSelect,
                                        onClose,
                                        title = '은행 선택',
                                      }: BankSelectBottomSheetProps) {
  // 'other' 입력 모드 — 기타 셀 클릭 시 활성
  const [etcMode, setEtcMode] = useState(false);
  const [etcInput, setEtcInput] = useState('');

  // 시트가 열릴 때 상태 초기화. 이미 'other'로 저장돼 있던 라벨이 있으면 pre-fill.
  useEffect(() => {
    if (!open) return;
    if (selected === 'other' && selectedLabel) {
      setEtcInput(selectedLabel);
    } else {
      setEtcInput('');
    }
    setEtcMode(false);
  }, [open, selected, selectedLabel]);

  const handleConfirmEtc = () => {
    const v = etcInput.trim();
    if (!v) return;
    onSelect('other', v);
  };

  return (
    <CommonBottomSheet open={open} onCloseAction={onClose}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {etcMode && (
            <button
              type="button"
              aria-label="뒤로"
              onClick={() => setEtcMode(false)}
              className="p-1 -ml-1 text-gray-500"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="text-[17px] font-bold text-black">
            {etcMode ? '은행명 직접 입력' : title}
          </div>
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="p-1 -m-1 text-gray-400"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {etcMode ? (
        /* 직접 입력 모드 */
        <div className="px-4 pb-5">
          <input
            type="text"
            value={etcInput}
            onChange={(e) => setEtcInput(e.target.value)}
            placeholder="은행/금융사 이름을 입력하세요"
            autoFocus
            maxLength={30}
            className="w-full text-[15px] font-medium text-black placeholder:text-[#BFC2C5] bg-[#F7F8F9] rounded-xl px-4 py-3.5 outline-none focus:ring-[1.5px] focus:ring-inset focus:ring-black"
          />
          <button
            type="button"
            onClick={handleConfirmEtc}
            disabled={etcInput.trim().length === 0}
            className={`mt-3 w-full h-[48px] rounded-[12px] text-[15px] font-bold transition-all ${
              etcInput.trim().length > 0
                ? 'bg-black text-white active:scale-[0.98]'
                : 'bg-[#E5E7EB] text-[#BFC2C5]'
            }`}
          >
            확인
          </button>
        </div>
      ) : (
        /* 3열 그리드 */
        <div className="max-h-[60dvh] overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {BANK_KEYS.map((code) => (
              <BankCell
                key={code}
                isSelected={selected === code}
                onClick={() => onSelect(code, BANK_LABELS[code])}
                icon={<BankOrCardIcon name={code} size={28}/>}
                name={BANK_LABELS[code]}
              />
            ))}
            {/* 기타 — 클릭 시 입력 모드 진입 */}
            <BankCell
              isSelected={selected === 'other'}
              onClick={() => setEtcMode(true)}
              icon={<OtherBankIcon/>}
              name="기타"
            />
          </div>
        </div>
      )}
    </CommonBottomSheet>
  );
}
