import React from "react";
import { notFound } from "next/navigation";
import { CommunityPass, CommunityNotice } from "@/app/community/community.mock";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { getCommunityRoomsAction, getCommunityRoomsAvailabilityAction } from "@/app/community/community.actions";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { PracticeBackButton } from "@/app/studios/[id]/practice/PracticeBackButton";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { PracticePassList } from "@/app/studios/[id]/practice/PracticePassList";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";
import { PracticeActionProvider } from "@/app/studios/[id]/practice/PracticeActionBar";
import { PracticeNoticeList } from "@/app/studios/[id]/practice/PracticeNoticeList";
import { PracticeImageCarousel } from "@/app/studios/[id]/practice/PracticeImageCarousel";
import { getLocale, translate } from "@/utils/translate";

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 연습실 전용 스튜디오(type=PracticeRoom) 상세. 기본정보/소개/편의시설/이용권/공지/홀·슬롯 전부 실 API.
// (GET /studios/:id — description/amenities/passPlans/announcements 포함 + /studioRooms 슬롯)
// studios/[id] 라우트에서 type이 PracticeRoom일 때 렌더.
export async function PracticeRoomStudioDetail({ id }: { id: number }) {
  const studio = await getStudioDetail(id);
  if (!('name' in studio)) notFound();

  const locale = await getLocale();
  const popularLabel = await translate('popular');

  const today = toDateStr(new Date());
  // 홀 스펙(홀정보)과 예약 현황(슬롯)은 이제 라우트가 분리됨 → 병렬 조회 후 studioRoomId↔id로 병합
  const [roomsRes, availRes] = await Promise.all([
    getCommunityRoomsAction({ studioId: id }),
    getCommunityRoomsAvailabilityAction({ studioId: id, date: today }),
  ]);
  const roomSpecs = ('studioRooms' in roomsRes) ? roomsRes.studioRooms : [];
  const availRows = ('rooms' in availRes) ? availRes.rooms : [];
  const slotsByRoom = new Map(availRows.map((r) => [r.studioRoomId, r.slots]));
  // GET /studios/:id 의 practiceRooms 스펙(설명·면적·치수·바닥·시설)을 홀에 병합 (홀 정보 시트용)
  const specById = new Map((studio.practiceRooms ?? []).map((p) => [p.id, p]));
  const rooms = roomSpecs.map((r) => {
    const p = specById.get(r.id);
    return {
      ...r,
      slots: slotsByRoom.get(r.id) ?? [],
      description: r.description ?? p?.description,
      areaSize: r.areaSize ?? p?.areaSize,
      dimensions: r.dimensions ?? p?.dimensions,
      floorType: r.floorType ?? p?.floorType,
      amenities: (r.amenities && r.amenities.length > 0) ? r.amenities : p?.amenities,
      maxNumber: r.maxNumber ?? p?.maxNumber ?? 0,
    };
  });

  // 이용권 — 일반 스튜디오와 동일한 전용 소스(GET /studios/:id/passPlans) 사용
  const passPlansRes = await getPassPlanListAction({ studioId: id });
  const rawPassPlans = ('passPlans' in passPlansRes) ? passPlansRes.passPlans : [];

  // 대표 이미지: images 우선, 없으면 cover/profile
  const images = (studio.images && studio.images.length > 0)
    ? studio.images
    : [studio.coverImageUrl, studio.profileImageUrl].filter((u): u is string => !!u);
  const address = studio.address ?? studio.roadAddress ?? '';
  const description = studio.description ?? undefined;
  // 편의시설 — 건물 시설 + 방(홀) 시설을 합쳐 enabled만, amenity 코드로 중복 제거
  const amenityMap = new Map<string, { amenity: string; label: string }>();
  for (const a of (studio.amenities ?? [])) if (a.enabled) amenityMap.set(a.amenity, a);
  for (const r of rooms) for (const a of (r.amenities ?? [])) if (a.enabled) amenityMap.set(a.amenity, a);
  const amenities = [...amenityMap.values()];
  // 이용권 — 전용 passPlans 소스 → PracticePassList 형태로 매핑
  const passes: CommunityPass[] = rawPassPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price ?? 0,
    period: p.expireDateStamp,
    tag: p.tag ?? (p.isPopular ? popularLabel : undefined),
  }));
  // 공지 — 스튜디오 announcements 실데이터 (날짜 필드 없음)
  const notices: CommunityNotice[] = (studio.announcements ?? []).map((a) => ({
    title: a.title,
    content: a.body,
    imageUrl: a.imageUrl,
  }));

  return (
    <div className="relative min-h-screen bg-white pb-[100px]">
      <PracticeActionProvider>
        <PracticeBackButton />

        {/* 대표 이미지 (캐러셀) */}
        <PracticeImageCarousel images={images} alt={studio.name} />

        {/* 이름 · 주소 · 최저가 */}
        <div className="px-4 pt-4">
          <h1 className="text-[22px] font-bold text-[#171717] leading-tight">{studio.name}</h1>
          {address && (
            <p className="mt-2 flex items-start gap-1.5 text-[14px] font-medium text-[#4E5968]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-[2px] shrink-0">
                <path d="M12 21S5 14 5 9.5C5 5.91 8.13 3 12 3C15.87 3 19 5.91 19 9.5C19 14 12 21 12 21Z" stroke="#8A949E" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.2" stroke="#8A949E" strokeWidth="1.8" />
              </svg>
              <span>{address}</span>
            </p>
          )}
        </div>

        {/* 소개 */}
        {description && (
          <div className="px-4 mt-7">
            <h2 className="text-[16px] font-bold text-[#171717] mb-2">{await translate('community_intro')}</h2>
            <p className="text-[14px] text-[#4E5968] leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* 공지사항 */}
        {notices.length > 0 && (
          <div className="px-4 mt-7">
            <h2 className="text-[16px] font-bold text-[#171717] mb-2.5">{await translate('community_notice')}</h2>
            <PracticeNoticeList notices={notices} studioId={id} locale={locale} />
          </div>
        )}

        {/* 편의시설 */}
        {amenities.length > 0 && (
          <div className="px-4 mt-7">
            <h2 className="text-[16px] font-bold text-[#171717] mb-2.5">{await translate('community_amenities')}</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span key={a.amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F9] border border-[#EEF0F2] text-[13px] font-medium text-[#333]">
                  <PracticeAmenityIcon name={a.label} className="w-4 h-4 shrink-0" />
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 홀별 예약 현황 — 실제 슬롯 */}
        <div className="px-4 mt-8">
          <h2 className="text-[16px] font-bold text-[#171717] mb-3">{await translate('community_hall_status')}</h2>
          <PracticeHallSchedule rooms={rooms} studioId={id} locale={locale} />
        </div>

        {/* 이용권 (패스권) */}
        {passes.length > 0 && (
          <div className="px-4 mt-8">
            <h2 className="text-[16px] font-bold text-[#171717] mb-3">{await translate('community_pass')}</h2>
            <PracticePassList passes={passes} studioId={id} locale={locale} />
          </div>
        )}
      </PracticeActionProvider>
    </div>
  );
}
