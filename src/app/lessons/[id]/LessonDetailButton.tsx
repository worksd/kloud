'use client'

import { GetLessonButtonResponse } from "@/app/endpoint/lesson.endpoint";
import React from "react";

type IProps = {
  children: React.ReactNode;
  disabled?: boolean;
  originProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
};

const CommonSubmitButton = ({ children, disabled, originProps }: IProps) => {
  // useMemo 불필요: 단순 논리 계산
  const isDisable = Boolean(disabled ?? originProps?.disabled);

  return (
    <button
      disabled={isDisable}
      className={`flex justify-center font-bold items-center w-full h-14 rounded-lg active:scale-[0.95] transition-transform duration-150 select-none ${
        isDisable ? "bg-[#bcbfc2]" : "bg-black text-white"
      }`}
      {...originProps}
    >
      {children}
    </button>
  );
};

/** 'YYYY.MM.DD HH:mm:ss' -> ISO 로 변환하여 Date 안전 파싱 */
function parseActivateAtToTime(activateAt: string): number {
  // 예: '2025.08.15 17:13:00' -> '2025-08-15T17:13:00'
  const iso = activateAt.replace(/\./g, '-').replace(' ', 'T');
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : NaN;
}

/** now 보다 과거(<=)인 것 중 가장 최근(max) 하나 선택 */
function pickAvailableButton(
  buttons: GetLessonButtonResponse[],
  now: Date
): GetLessonButtonResponse | null {
  const nowTs = now.getTime();
  let latest: { btn: GetLessonButtonResponse; ts: number } | null = null;

  for (const btn of buttons) {
    const ts = parseActivateAtToTime(btn.activateAt);
    if (!Number.isFinite(ts)) continue;        // 파싱 실패 보호
    if (ts <= nowTs) {
      if (!latest || ts > latest.ts) {
        latest = { btn, ts };
      }
    }
  }
  return latest ? latest.btn : null;
}

export const LessonDetailButton = ({ buttons }: { buttons: GetLessonButtonResponse[] }) => {
  if (!buttons || buttons.length === 0) {
    return (
      <CommonSubmitButton disabled>
        현재 수업 결제가 불가능합니다
      </CommonSubmitButton>
    );
  }

  const now = new Date();
  const availableButton = pickAvailableButton(buttons, now);

  if (!availableButton) {
    return (
      <CommonSubmitButton disabled>
        현재 수업 결제가 불가능합니다
      </CommonSubmitButton>
    );
  }

  const handleOnClick = ({ route }: { route?: string }) => {
    if (!route) return;
    if (typeof window !== 'undefined' && window.KloudEvent?.push) {
      window.KloudEvent.push(route);
    }
  };

  return (
    <CommonSubmitButton
      disabled={!availableButton.route}
      originProps={{
        onClick: () => handleOnClick({ route: availableButton.route }),
      }}
    >
      {availableButton.title}
    </CommonSubmitButton>
  );
};