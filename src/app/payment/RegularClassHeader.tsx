import React from "react";
import { CircleImage } from "@/app/components/CircleImage";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";

type RegularClass = NonNullable<GetPaymentResponse['regularClass']>;

/**
 * 정규반 결제 헤더 — 학원(로고 + 이름) → 반 이름. 담당 강사는 RegularClassArtistSection 으로 따로.
 * variant: mobile(본문 풀폭) / pc(우측 요약 카드)
 */
export const RegularClassHeader = ({ regularClass, variant }: { regularClass: RegularClass; variant: 'mobile' | 'pc' }) => {
  const studio = regularClass.studio;
  const pc = variant === 'pc';
  return (
    <div className={pc ? 'flex flex-col gap-2' : 'px-6 pt-4 pb-4 flex flex-col gap-2.5'}>
      {(studio?.profileImageUrl || studio?.name) && (
        <div className="flex items-center gap-2 min-w-0">
          {studio?.profileImageUrl && <CircleImage size={pc ? 24 : 28} imageUrl={studio.profileImageUrl} />}
          <span className={`${pc ? 'text-[13px]' : 'text-[14px]'} font-semibold text-[#4E5968] truncate`}>{studio?.name}</span>
        </div>
      )}
      <p className={`${pc ? 'text-[19px]' : 'text-[22px]'} font-bold text-black leading-snug break-words`}>{regularClass.name}</p>
    </div>
  );
};

/**
 * 담당 강사 섹션 — 강사가 있을 때만(artist null 은 정상 데이터: 미정/삭제).
 * 이름은 nickName || name (name 은 null 이 아니라 빈 문자열로 온다). 사진이 없으면 기본 사람 아이콘.
 */
export const RegularClassArtistSection = ({ regularClass, title, variant }: {
  regularClass: RegularClass;
  /** '담당 강사' — 서버에서 번역해 넘긴다 */
  title: string;
  variant: 'mobile' | 'pc';
}) => {
  const artist = regularClass.artist;
  const name = artist ? (artist.nickName || artist.name) : '';
  if (!artist || !name) return null;
  const pc = variant === 'pc';
  return (
    <section className={pc ? 'flex flex-col gap-2.5' : 'px-6 pt-4 pb-5'}>
      <h2 className={`${pc ? 'text-[14px]' : 'text-[16px] mb-3'} font-bold text-black`}>{title}</h2>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`${pc ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden bg-[#E9EBEE] flex items-center justify-center shrink-0`}>
          {artist.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.profileImageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <circle cx="12" cy="8" r="3.5" stroke="#8A949E" strokeWidth="1.6" />
              <path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" stroke="#8A949E" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`${pc ? 'text-[14px]' : 'text-[15px]'} font-bold text-black truncate`}>{name}</span>
          {/* 예명과 본명이 둘 다 있고 다르면 본명을 보조로 */}
          {artist.nickName && artist.name && artist.nickName !== artist.name && (
            <span className="text-[12px] text-[#86898C] truncate">{artist.name}</span>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * 정규반 안내사항 카드 — 반 설명(description)을 잘라내지 않고 전부(줄바꿈 유지) 보여준다.
 * 본문에 그냥 뿌리면 시처럼 붕 떠 보여서, 테두리 있는 라운드 카드 + 아이콘 제목 줄로 묶는다.
 */
export const RegularClassNoticeCard = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-[#EEF0F2] bg-[#FAFBFC] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EEF0F2] bg-white">
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] shrink-0">
        <circle cx="12" cy="12" r="9" stroke="#4E5968" strokeWidth="1.8" />
        <path d="M12 11v5" stroke="#4E5968" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="7.8" r="1.1" fill="#4E5968" />
      </svg>
      <h2 className="text-[15px] font-bold text-black truncate">{title}</h2>
    </div>
    <p className="px-4 py-4 text-[14px] text-[#333D4B] leading-[1.7] whitespace-pre-line break-words">{description}</p>
  </div>
);
