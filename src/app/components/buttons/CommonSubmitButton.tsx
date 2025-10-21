import { useMemo } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IProps = {
    children: ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    originProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

const CommonSubmitButton = ({ children, disabled, isLoading, originProps }: IProps) => {
    const isDisable = useMemo(
      () => Boolean(disabled || originProps?.disabled),
      [disabled, originProps?.disabled]
    );
    const isBlocked = isDisable || !!isLoading;

    return (
      <button
        {...originProps}
        disabled={isBlocked}
        aria-busy={!!isLoading}
        aria-disabled={isBlocked}
        className={[
            'relative flex justify-center items-center w-full p-4 rounded-[16px]',
            'font-bold select-none transition-transform duration-150',
            isBlocked ? 'bg-[#bcbfc2] cursor-not-allowed' : 'bg-black active:scale-[0.95]',
            originProps?.className || ''
        ].join(' ')}
      >
          {/* 실제 텍스트는 자리를 유지 (로딩 때 투명) */}
          <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>

          {/* 로딩 스피너 (중앙) */}
          {isLoading && (
            <span
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
          <svg
            className="h-5 w-5 animate-spin text-white"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-30"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>
          )}
      </button>
    );
};

export default CommonSubmitButton;