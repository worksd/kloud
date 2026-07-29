import { HeaderInDetail } from "@/app/components/headers";
import Image from "next/image";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { getLocale, translate } from "@/utils/translate";
import { LessonBookingList } from "@/app/studios/[id]/lessons/LessonBookingList";
import { TimeTable } from "@/app/studios/timetable/TimeTable";
import { StudioInstaLink } from "@/app/studios/[id]/StudioInstaLink";
import { StudioSlugCopy } from "@/app/studios/[id]/StudioSlugCopy";
import { StudioAddressLink } from "@/app/studios/[id]/StudioAddressLink";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { StudioCollapsingTopBar } from "@/app/studios/[id]/StudioCollapsingTopBar";
import { ScrollContainer } from "@/app/studios/[id]/ScrollContainer";
import { YoutubeContentSection } from "@/app/studios/[id]/YoutubeContentSection";
import { getYoutubeContents } from "@/app/studios/[id]/get.youtube.contents.action";
import { LessonGroupBand } from "@/app/home/LessonGroupBand";
import { PracticeHallSection } from "@/app/studios/[id]/practice/PracticeHallSection";
import { PracticeNoticeList } from "@/app/studios/[id]/practice/PracticeNoticeList";
import { StudioPassList } from "@/app/studios/[id]/practice/StudioPassList";
import { PracticeActionProvider } from "@/app/studios/[id]/practice/PracticeActionBar";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";
import { CommunityNotice, CommunityPass } from "@/app/community/community.mock";
import { formatRuleDescription } from "@/utils/pass.description";

export const StudioDetailForm = async ({id, appVersion}: { id: number, appVersion: string }) => {

  const studio = await getStudioDetail(id);

  if (!('id' in studio)) return notFound();

  // BE가 resolve해둔 channelKey로 YouTube API 직접 호출. 키 없거나 실패 시 빈 배열 → 영역 숨김.
  const youtubeContents = await getYoutubeContents(studio.youtubeChannelKey);
  const hasLessons = (studio.lessons?.length ?? 0) > 0;
  const hasHalls = (studio.practiceRooms?.length ?? 0) > 0;
  const locale = await getLocale();
  const popularLabel = await translate('popular');
  // 공지 — 새 아코디언 UI(PracticeNoticeList) 형태로 매핑
  const notices: CommunityNotice[] = (studio.announcements ?? []).map((a) => ({
    title: a.title,
    content: a.body,
    imageUrl: a.imageUrl ?? undefined,
    createdAt: a.createdAt ?? undefined,
  }));
  // 이용권 — studio.passPlans를 community/[id]와 동일한 StudioPassList 형태로 매핑
  const passes: CommunityPass[] = (studio.passPlans ?? []).map((p) => {
    // 제목 밑 혜택 요약 — 기존 유틸(formatRuleDescription)로 첫 rule을 문구화. (PassPlanItem과 동일)
    const firstRule = p.rules?.[0];
    const description = firstRule?.target && firstRule?.benefit
      ? formatRuleDescription(
          { target: firstRule.target, benefit: firstRule.benefit, duration: firstRule.duration, excludes: firstRule.excludes },
          locale,
          p.name,
        )
      : undefined;
    return {
      id: p.id,
      name: p.name,
      price: p.price ?? 0,
      period: p.expireDateStamp,
      tag: p.tag ?? (p.isRecommended ? popularLabel : undefined),
      description,
    };
  });
  const hasPasses = passes.length > 0;
  // 건물 편의시설 — enabled만 (홀 자체 시설은 홀 정보 시트에서 별도 표시)
  const amenities = (studio.amenities ?? []).filter((a) => a.enabled);
  // 웹 주소 도메인 — GUINNESS_API_SERVER에 'prod'가 있으면 운영, 아니면 스테이징
  const webBaseUrl = (process.env.GUINNESS_API_SERVER ?? '').includes('prod')
    ? 'https://rawgraphy.com'
    : 'https://staging.rawgraphy.com';

  return (
    <ScrollContainer className="w-full h-screen bg-white flex flex-col pb-32 box-border overflow-y-auto no-scrollbar studio-detail-container">
      {/* Collapsing 탑바 — 최상단이면 백버튼만(이미지 위), 스크롤 내리면 흰 탑바 + 제목 페이드 인 */}
      <StudioCollapsingTopBar title={studio.name} appVersion={appVersion} profileImageUrl={studio.profileImageUrl} />

      {/* 헤더 — 커버 이미지(풀블리드) + 하단 이름/slug 오버레이 (프로필 로고 없음) */}
      <div
        style={{ backgroundImage: `url(${studio.coverImageUrl ?? studio.profileImageUrl})` }}
        className="studio-cover w-full relative -mt-10 aspect-[2/3] bg-cover bg-[center_30%] bg-no-repeat
          before:content-[''] before:absolute before:inset-0 before:block
          before:bg-gradient-to-b before:from-transparent before:from-[70%] before:to-white before:to-100% before:z-10"
      >
        {/* 커버 하단 오버레이 — 이름 → slug(@핸들) → 인스타 아이콘 세로 정렬. 주소는 노출하지 않음 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-0 -mb-1 flex flex-col items-start">
          <div className="text-[#131517] text-2xl font-bold leading-tight">{studio.name}</div>
          {studio.address && <StudioAddressLink address={studio.address} appVersion={appVersion} />}
          {/* slug(앱 아이콘 + @핸들) — 탭하면 주소 복사 + 토스트. 아래 인스타 행과 동일 규격 */}
          {studio.slug && <StudioSlugCopy slug={studio.slug} baseUrl={webBaseUrl} locale={locale} />}
          {studio.instagramAddress && (
            <div className="mt-1.5 pb-3 max-w-full min-w-0">
              <StudioInstaLink url={studio.instagramAddress} appVersion={appVersion} />
            </div>
          )}
        </div>
      </div>

      {/* 상세 영역 — 모든 섹션은 회색 구분선 + 동일 상단여백(pt-6)으로 통일 */}
      <div className="flex flex-col">

        {/* 공지사항 */}
        {notices.length > 0 && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-2"/>
            <section className="px-4 pt-6">
              <div className="text-[20px] text-black font-bold mb-2.5">{await translate('studio_announcement')}</div>
              <PracticeNoticeList notices={notices} studioId={studio.id} locale={locale} />
            </section>
          </>
        )}

        {/* 배너 — 시간표 위. 커버/공지와 간격을 넉넉히 */}
        {studio.banners && studio.banners.length > 0 && (
          <section className="pt-4 pb-1">
            <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
              {studio.banners.map((banner) => {
                const isExpired = new Date(banner.endDate) < new Date();
                if (isExpired) return null;
                return (
                  <NavigateClickWrapper key={banner.id} method="push" route={banner.route}>
                    <div className="min-w-[calc(100vw-32px)] snap-start pl-4">
                      <div className="w-full aspect-[32/9] relative rounded-2xl overflow-hidden">
                        <Image src={banner.imageUrl} alt={banner.description || '배너'} fill className="object-cover"/>
                      </div>
                    </div>
                  </NavigateClickWrapper>
                );
              })}
            </div>
          </section>
        )}

        {/* 시간표 — 진행중인 수업이 있을 때만 */}
        {hasLessons && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <TimeTableServerComponent studioId={studio.id} useSheet noMargin/>
          </>
        )}

        {/* 정기수업 */}
        {studio.lessonGroups && studio.lessonGroups.length > 0 && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <LessonGroupBand lessonGroups={studio.lessonGroups} locale={locale} />
          </>
        )}

        {/* 진행중인 수업 — 탭 시 바텀시트로 정보 + 바로 결제 */}
        {hasLessons && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <div className="pt-6">
              <LessonBookingList
                studioId={studio.id}
                title={await translate('ongoing_lessons')}
                lessons={studio.lessons ?? []}
                locale={locale}
                appVersion={appVersion}
              />
            </div>
          </>
        )}

        {/* YouTube — 신청 가능한 수업 아래 */}
        {youtubeContents.length > 0 && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <YoutubeContentSection
              contents={youtubeContents}
              title="최근 YouTube 영상"
              channelUrl={studio.youtubeUrl}
              locale={locale}
            />
          </>
        )}

        {/* 홀(연습실) 예약현황 */}
        {hasHalls && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <section className="pt-6">
              <PracticeHallSection studioId={studio.id} practiceRooms={studio.practiceRooms} locale={locale} />
            </section>
          </>
        )}

        {/* 이용권 */}
        {hasPasses && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <section className="px-4 pt-6">
              <h2 className="text-[20px] font-bold text-black mb-3">{await translate('community_pass')}</h2>
              <PracticeActionProvider>
                <StudioPassList passes={passes} studioId={studio.id} locale={locale} />
              </PracticeActionProvider>
            </section>
          </>
        )}

        {/* 편의시설 — 건물 시설(enabled만) */}
        {amenities.length > 0 && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <section className="px-4 pt-6">
              <div className="text-[20px] text-black font-bold mb-2.5">{await translate('community_amenities')}</div>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a.amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F9] border border-[#EEF0F2] text-[13px] font-medium text-[#333]">
                    <PracticeAmenityIcon name={a.label} className="w-4 h-4 shrink-0" />
                    {a.label}
                  </span>
                ))}
              </div>
            </section>
          </>
        )}

      </div>

    </ScrollContainer>
  );
}