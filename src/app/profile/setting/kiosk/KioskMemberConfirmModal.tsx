'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type UserItem = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  profileImageUrl?: string;
};

type KioskMemberConfirmModalProps = {
  phone: string;
  userName: string;
  profileImageUrl?: string;
  locale: Locale;
  onBack: () => void;
  onConfirm: () => void;
  users?: UserItem[];
  onSelectUser?: (user: UserItem) => void;
};

const UserAvatar = ({ profileImageUrl }: { profileImageUrl?: string }) => (
  <div className="w-[min(7.4vw,80px)] h-[min(7.4vw,80px)] rounded-full bg-[#E8E8EA] flex items-center justify-center flex-shrink-0 overflow-hidden">
    {profileImageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
    ) : (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="#B1B8BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="#B1B8BE" strokeWidth="2"/>
      </svg>
    )}
  </div>
);

const formatPhone = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
};

export const KioskMemberConfirmModal = ({ phone, userName, profileImageUrl, locale, onBack, onConfirm, users, onSelectUser }: KioskMemberConfirmModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const isSelectMode = users && users.length > 1 && onSelectUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1000px] bg-white rounded-[42px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 타이틀 */}
        <div className="px-[min(5.6vw,60px)] pt-[min(5.6vw,60px)] pb-[min(1.8vw,20px)]">
          <p className="text-black text-[min(4.8vw,52px)] font-bold leading-tight">
            {isSelectMode ? t('kiosk_select_user_title') : t('kiosk_member_confirm_title')}
          </p>
        </div>

        {/* 유저 선택 모드 */}
        {isSelectMode ? (
          <div className="px-[min(3.7vw,40px)] py-[min(1.8vw,20px)] flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser!(user)}
                className="flex items-center gap-[min(2.2vw,24px)] bg-[#F9F9FB] rounded-[32px] px-[min(3.7vw,40px)] py-[min(2.9vw,32px)] active:bg-[#F0F0F0] transition-colors"
              >
                <UserAvatar profileImageUrl={user.profileImageUrl} />
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-black text-[min(3.7vw,40px)] font-bold">{user.nickName ?? user.name ?? '-'}</span>
                  {user.name && user.nickName && (
                    <span className="text-[#8A949E] text-[min(2.2vw,24px)]">{user.name}</span>
                  )}
                  {user.phone && <span className="text-[#6D7882] text-[min(2.6vw,28px)]">{user.phone}</span>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* 단일 유저 확인 모드 */
          <div className="px-[min(3.7vw,40px)] py-[min(1.8vw,20px)]">
            <div className="flex items-center gap-[min(2.2vw,24px)] bg-[#F9F9FB] rounded-[32px] px-[min(3.7vw,40px)] py-[min(2.9vw,32px)]">
              <UserAvatar profileImageUrl={profileImageUrl} />
              <div className="flex flex-col gap-1">
                <span className="text-black text-[min(3.7vw,40px)] font-bold">{userName}</span>
                <span className="text-[#6D7882] text-[min(2.6vw,28px)]">{formatPhone(phone)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-[min(2.6vw,28px)] px-[min(4vw,44px)] pt-[min(2.9vw,32px)] pb-[min(4.4vw,48px)]">
          <button
            onClick={onBack}
            className="flex-[280] h-[min(13.9vw,150px)] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] text-[min(4.2vw,45px)] font-bold">{t('kiosk_back')}</span>
          </button>
          {!isSelectMode && (
            <button
              onClick={onConfirm}
              className="flex-[604] h-[min(13.9vw,150px)] rounded-[32px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white text-[min(4.2vw,45px)] font-bold">{t('confirm')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
