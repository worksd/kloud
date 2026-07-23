'use client';

import React, { createContext, useContext, useState, ReactNode } from "react";

// 홀 시간 선택 / 이용권 선택 → 하단 고정 액션 바를 공유. 선택한 순간 버튼이 나타남.
export type PracticeAction = { source: string; label: string; onConfirm: () => void };

const Ctx = createContext<{
  setAction: (a: PracticeAction) => void;
  clearAction: (source: string) => void;
  activeSource: string | null;
} | null>(null);

export function usePracticeAction() {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePracticeAction must be used within PracticeActionProvider');
  return c;
}

export function PracticeActionProvider({ children }: { children: ReactNode }) {
  const [action, setActionState] = useState<PracticeAction | null>(null);

  const setAction = (a: PracticeAction) => setActionState(a);
  const clearAction = (source: string) =>
    setActionState((prev) => (prev && prev.source === source ? null : prev));

  return (
    <Ctx.Provider value={{ setAction, clearAction, activeSource: action?.source ?? null }}>
      {children}
      {action && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-[#F1F3F6] animate-[slideUp_220ms_ease-out]">
          <button
            onClick={action.onConfirm}
            className="w-full h-14 rounded-2xl bg-[#171717] flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            <span className="text-white text-[16px] font-bold">{action.label}</span>
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
