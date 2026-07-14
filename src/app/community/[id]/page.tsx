import React from "react";
import { notFound } from "next/navigation";
import { getMockCommunityStudio, defaultCommunityPasses, defaultCommunityNotices } from "@/app/community/community.mock";
import { CommunityBackButton } from "@/app/community/[id]/CommunityBackButton";
import { CommunityHallSchedule } from "@/app/community/[id]/CommunityHallSchedule";
import { CommunityPassList } from "@/app/community/[id]/CommunityPassList";
import { CommunityAmenityIcon } from "@/app/community/[id]/CommunityAmenityIcon";
import { CommunityActionProvider } from "@/app/community/[id]/CommunityActionBar";
import { CommunityNoticeList } from "@/app/community/[id]/CommunityNoticeList";
import { CommunityImageCarousel } from "@/app/community/[id]/CommunityImageCarousel";

// 연습실 전용 스튜디오 상세 — 댄스 강습 스튜디오 상세와는 별개의 UI. (ignoreSafeArea)
// 실제 API 나오기 전 Mock.
export default async function CommunityStudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const studio = getMockCommunityStudio(id);
  if (!studio) notFound();

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const minPrice = studio.halls.length > 0 ? Math.min(...studio.halls.map((h) => h.pricePerHour)) : undefined;

  return (
    <div className="relative min-h-screen bg-white pb-[100px]">
      <CommunityActionProvider>
      <CommunityBackButton />

      {/* 대표 이미지 (캐러셀) */}
      <CommunityImageCarousel
        images={studio.images ?? (studio.imageUrl ? [studio.imageUrl] : [])}
        alt={studio.name}
      />

      {/* 이름 · 주소 · 최저가 */}
      <div className="px-4 pt-4">
        <h1 className="text-[22px] font-bold text-[#171717] leading-tight">{studio.name}</h1>
        <p className="mt-2 flex items-start gap-1.5 text-[14px] font-medium text-[#4E5968]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-[2px] shrink-0">
            <path d="M12 21S5 14 5 9.5C5 5.91 8.13 3 12 3C15.87 3 19 5.91 19 9.5C19 14 12 21 12 21Z" stroke="#8A949E" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="12" cy="9.5" r="2.2" stroke="#8A949E" strokeWidth="1.8" />
          </svg>
          <span>{studio.address}</span>
        </p>
        {minPrice != null && (
          <p className="mt-3 text-[18px] font-bold text-[#171717]">시간당 {fmt(minPrice)}원부터</p>
        )}
      </div>

      {/* 소개 */}
      {studio.description && (
        <div className="px-4 mt-7">
          <h2 className="text-[16px] font-bold text-[#171717] mb-2">소개</h2>
          <p className="text-[14px] text-[#4E5968] leading-relaxed whitespace-pre-line">{studio.description}</p>
        </div>
      )}

      {/* 공지사항 */}
      <div className="px-4 mt-7">
        <h2 className="text-[16px] font-bold text-[#171717] mb-2.5">공지사항</h2>
        <CommunityNoticeList notices={studio.notices ?? defaultCommunityNotices()} />
      </div>

      {/* 편의시설 */}
      {studio.amenities && studio.amenities.length > 0 && (
        <div className="px-4 mt-7">
          <h2 className="text-[16px] font-bold text-[#171717] mb-2.5">편의시설</h2>
          <div className="flex flex-wrap gap-2">
            {studio.amenities.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F9] border border-[#EEF0F2] text-[13px] font-medium text-[#333]">
                <CommunityAmenityIcon name={a} className="w-4 h-4 shrink-0" />
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 홀별 예약 현황 — 날짜 선택 + 시간 바 */}
      <div className="px-4 mt-8">
        <h2 className="text-[16px] font-bold text-[#171717] mb-3">홀별 예약 현황</h2>
        <CommunityHallSchedule halls={studio.halls} />
      </div>

      {/* 이용권 (패스권) */}
      <div className="px-4 mt-8">
        <h2 className="text-[16px] font-bold text-[#171717] mb-3">이용권</h2>
        <CommunityPassList passes={studio.passes ?? defaultCommunityPasses(studio.id)} />
      </div>

      {/* 유의사항 */}
      {studio.notes && studio.notes.length > 0 && (
        <div className="px-4 mt-8">
          <h2 className="text-[16px] font-bold text-[#171717] mb-2">유의사항</h2>
          <ul className="flex flex-col gap-1.5">
            {studio.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[13px] text-[#86898C] leading-snug">
                <span className="mt-[6px] w-1 h-1 rounded-full bg-[#C4C9CF] shrink-0" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      </CommunityActionProvider>
    </div>
  );
}
