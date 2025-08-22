'use client';

import React, { ComponentProps, useCallback, useState } from 'react';
import CommonSubmitButton from './CommonSubmitButton';

type Props = {
  children: React.ReactNode;
  /** 비동기 클릭 핸들러 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  /** 외부 비활성화(폼 검증 등) */
  disabled?: boolean;
  /** CommonSubmitButton에 그대로 전달할 원본 props (type, aria 등) */
  originProps?: ComponentProps<'button'>;
  /** 로딩 중에 보여줄 문구 (없으면 children 유지) */
  loadingText?: string;
};

export default function AsyncCommonSubmitButton({
                                                  children,
                                                  onClick,
                                                  disabled,
                                                  originProps,
                                                  loadingText,
                                                }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled || originProps?.disabled) return;
      try {
        setLoading(true);
        await onClick?.(e);
      } finally {
        setLoading(false);
      }
    },
    [loading, disabled, originProps?.disabled, onClick]
  );

  return (
    <CommonSubmitButton
      // 로딩 중에는 강제 disabled
      disabled={disabled || loading}
      originProps={{
        ...originProps,
        onClick: handleClick,
        // 접근성 힌트
        'aria-busy': loading,
        'aria-disabled': disabled || loading || originProps?.disabled,
      }}
    >
      {/* 스피너 + 텍스트 */}
      {loading && (
        <svg
          className="mr-2 inline-block animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" fill="none"/>
        </svg>
      )}
      {!loading &&
        <span>{loading && loadingText ? loadingText : children}</span>
      }
    </CommonSubmitButton>
  );
}