'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";

type UserItem = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
};

type KioskMemberConfirmModalProps = {
  phone: string;
  name?: string;
  nickName?: string;
  email?: string;
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
      <img src={kioskImageSrc(profileImageUrl, 160)} alt="" className="w-full h-full object-cover" />
    ) : (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="#B1B8BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="#B1B8BE" strokeWidth="2"/>
      </svg>
    )}
  </div>
);

// 가운데 4자리(두 번째 그룹)를 *로 가림 — 표기 전용(원본 phone은 그대로). 11자리 초과분도 잘리지 않게 표시.
const formatPhone = (digits: string) => {
  if (digits.length <= 3) return digits;
  const mid = (s: string) => '*'.repeat(s.length);
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${mid(digits.slice(3))}`;
  return `${digits.slice(0, 3)} ${mid(digits.slice(3, 7))} ${digits.slice(7)}`;
};

export const KioskMemberConfirmModal = ({ phone, name, nickName, email, profileImageUrl, locale, onBack, onConfirm, users, onSelectUser }: KioskMemberConfirmModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const isSelectMode = users && users.length > 1 && onSelectUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[80%] max-w-[640px] bg-white rounded-[28px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 타이틀 */}
        <div className="px-[min(3vw,32px)] pt-[min(3vw,32px)] pb-[min(1vw,12px)]">
          <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(2.4vw, 26px)' }}>
            {isSelectMode ? t('kiosk_select_user_title') : t('kiosk_member_confirm_title')}
          </p>
        </div>

        {/* 유저 선택 모드 */}
        {isSelectMode ? (
          <div className="px-[min(2.4vw,26px)] py-[min(1vw,12px)] flex flex-col gap-[min(1vw,12px)] max-h-[50vh] overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser!(user)}
                className="flex items-center gap-[min(1.4vw,16px)] bg-[#F9F9FB] rounded-[20px] px-[min(2.4vw,26px)] py-[min(1.8vw,20px)] active:bg-[#F0F0F0] transition-colors"
              >
                <UserAvatar profileImageUrl={user.profileImageUrl} />
                <div className="flex flex-col gap-[2px] text-left min-w-0">
                  <span className="text-black font-bold truncate" style={{ fontSize: 'min(1.9vw, 20px)' }}>{user.nickName ?? user.name ?? '-'}</span>
                  {user.name && user.nickName && (
                    <span className="text-[#8A949E] truncate" style={{ fontSize: 'min(1.4vw, 15px)' }}>{user.name}</span>
                  )}
                  {user.phone && <span className="text-[#6D7882]" style={{ fontSize: 'min(1.5vw, 16px)' }}>{formatPhone(user.phone)}</span>}
                  {user.email && <span className="text-[#6D7882] truncate" style={{ fontSize: 'min(1.5vw, 16px)' }}>{user.email}</span>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* 단일 유저 확인 모드 */
          <div className="px-[min(2.4vw,26px)] py-[min(1vw,12px)]">
            <div className="flex items-center gap-[min(1.4vw,16px)] bg-[#F9F9FB] rounded-[20px] px-[min(2.4vw,26px)] py-[min(1.8vw,20px)]">
              <UserAvatar profileImageUrl={profileImageUrl} />
              <div className="flex flex-col gap-[2px] min-w-0">
                <span className="text-black font-bold truncate" style={{ fontSize: 'min(1.9vw, 20px)' }}>{nickName ?? name ?? '-'}</span>
                {name && nickName && (
                  <span className="text-[#8A949E] truncate" style={{ fontSize: 'min(1.4vw, 15px)' }}>{name}</span>
                )}
                {phone && <span className="text-[#6D7882]" style={{ fontSize: 'min(1.5vw, 16px)' }}>{formatPhone(phone)}</span>}
                {email && <span className="text-[#6D7882] truncate" style={{ fontSize: 'min(1.5vw, 16px)' }}>{email}</span>}
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-[min(1.4vw,16px)] px-[min(2.4vw,26px)] pt-[min(1.6vw,18px)] pb-[min(2.4vw,26px)]">
          <button
            onClick={onBack}
            className="flex-[280] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(7vw, 76px)' }}
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2vw, 22px)' }}>{t('kiosk_back')}</span>
          </button>
          {!isSelectMode && (
            <button
              onClick={onConfirm}
              className="flex-[604] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
              style={{ height: 'min(7vw, 76px)' }}
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(2vw, 22px)' }}>{t('confirm')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
