'use client'

import { GetLessonButtonResponse } from "@/app/endpoint/lesson.endpoint";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

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

function parseKstLocalToEpoch(activateAt: string): number {
  const [d, t] = activateAt.trim().split(' ');
  const [Y, M, D] = d.split('.').map(Number);
  const [h, m, sStr] = t.split(':');
  const hh = Number(h), mm = Number(m), ss = Number(sStr ?? 0);
  // KST(= UTC+9) 로컬시각 -> UTC 로 변환: UTC = KST - 9h
  return Date.UTC(Y, M - 1, D, hh - 9, mm, ss);
}

function pickAvailableButton(
  buttons: GetLessonButtonResponse[],
  nowUtcMs: number
): GetLessonButtonResponse | null {
  let latest: { btn: GetLessonButtonResponse; ts: number } | null = null;

  for (const btn of buttons) {
    const ts = parseKstLocalToEpoch(btn.activateAt);
    if (!Number.isFinite(ts) || ts > nowUtcMs) continue;
    if (!latest || ts > latest.ts) latest = { btn, ts };
  }
  return latest ? latest.btn : null;
}

export const LessonDetailButton = ({id, buttons, appVersion}: {
  id: number,
  buttons: GetLessonButtonResponse[],
  appVersion: string
}) => {

  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, [])

  if (!mounted) return null;
  if (!buttons || buttons.length === 0) {
    return (
      <CommonSubmitButton disabled>
        현재 수업 결제가 불가능합니다
      </CommonSubmitButton>
    );
  }

  const nowUtc = Date.now(); // 이미 UTC(=GMT) 기준 epoch(ms)
  const availableButton = pickAvailableButton(buttons, nowUtc);

  if (!availableButton) {
    return (
      <CommonSubmitButton disabled>
        현재 수업 결제가 불가능합니다
      </CommonSubmitButton>
    );
  }

  const handleOnClick = async ({ route }: { route?: string }) => {
    if (!route) return;
    if (appVersion == '') {
      router.push(route)
    }
    else if (typeof window !== 'undefined' && window.KloudEvent?.push) {
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