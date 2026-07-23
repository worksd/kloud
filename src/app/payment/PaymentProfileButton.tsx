'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { clearCookies } from "@/app/profile/clear.token.action";

// 웹(웹뷰) 결제 페이지 우측 상단 프로필. 로그인 상태면 사진 노출, 탭하면 로그아웃 메뉴.
export function PaymentProfileButton({
  name,
  profileImageUrl,
  locale,
}: {
  name?: string;
  profileImageUrl?: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await unregisterDeviceAction();
    await clearCookies();
    setOpen(false);
    router.refresh();
  };

  const initial = (name ?? '').trim().charAt(0) || '?';

  return (
    <div ref={ref} className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="profile"
        className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden bg-[#F1F3F6] shadow-sm active:scale-95 transition-transform"
      >
        {profileImageUrl ? (
          <Image src={profileImageUrl} alt={name ?? 'profile'} width={36} height={36} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[14px] font-bold text-[#4E5968]">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-[128px] rounded-xl bg-white shadow-lg border border-[#EEF0F2] py-1 overflow-hidden">
          {name && (
            <div className="px-3 py-2 text-[13px] font-bold text-[#171717] truncate border-b border-[#F1F3F6]">{name}</div>
          )}
          <button
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 text-[14px] text-[#E5484D] font-medium active:bg-[#FAFBFC] disabled:opacity-50"
          >
            {getLocaleString({ locale, key: 'log_out' })}
          </button>
        </div>
      )}
    </div>
  );
}
