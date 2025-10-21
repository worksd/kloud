'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Gender = 'male' | 'female';

export function GenderBottomSheet({
                                    open,
                                    value,
                                    onSelectAction,
                                    onCloseAction,
                                    title = '성별 선택',
                                  }: {
  open: boolean;
  value?: Gender | '';
  onSelectAction: (g: Gender) => void;
  onCloseAction: () => void;
  title?: string;
}) {
  const isSelected = (g: Gender) => value === g;

  return (
    <div>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Dim */}
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onCloseAction}
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-xl"
            initial={{ y: 40, opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-gray-300" />
            {/* Header */}
            <div className="px-5 pt-3 pb-2">
              <div className="text-[18px] font-bold text-black">{title}</div>
            </div>

            {/* Options */}
            <div className="px-4 pb-6 space-y-3">
              <OptionButton
                label="여성"
                selected={isSelected('female')}
                onClick={() => onSelectAction('female')}
              />
              <OptionButton
                label="남성"
                selected={isSelected('male')}
                onClick={() => onSelectAction('male')}
              />
              {/* 하단 여백(홈 인디케이터 고려 — env 안 쓰고 적당한 패딩) */}
              <div className="h-1" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function OptionButton({
                        label,
                        selected,
                        onClick,
                      }: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl px-4 py-4 text-left flex items-center justify-between',
        'transition ring-1',
        selected
          ? 'bg-white ring-black text-black'
          : 'bg-white ring-gray-200 text-gray-800 hover:bg-gray-50',
      ].join(' ')}
    >
      <span className="text-[16px] font-semibold">{label}</span>
      {selected ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
