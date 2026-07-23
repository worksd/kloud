import { HeaderInDetail } from "@/app/components/headers";
import Image from "next/image";
import LocationIcon from "../../../../public/assets/location.svg";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { getLocale, translate } from "@/utils/translate";
import { LessonBookingList } from "@/app/studios/[id]/lessons/LessonBookingList";
import { TimeTable } from "@/app/studios/timetable/TimeTable";
import { StudioIcon } from "@/app/studios/[id]/StudioIcon";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import LeftArrow from "../../../../public/assets/left-arrow.svg";
import { ScrollContainer } from "@/app/studios/[id]/ScrollContainer";
import { YoutubeContentSection } from "@/app/studios/[id]/YoutubeContentSection";
import { getYoutubeContents } from "@/app/studios/[id]/get.youtube.contents.action";
import { LessonGroupBand } from "@/app/home/LessonGroupBand";
import { PracticeHallSection } from "@/app/studios/[id]/practice/PracticeHallSection";
import { PracticeNoticeList } from "@/app/studios/[id]/practice/PracticeNoticeList";
import { PracticePassList } from "@/app/studios/[id]/practice/PracticePassList";
import { PracticeActionProvider } from "@/app/studios/[id]/practice/PracticeActionBar";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";
import { CommunityNotice, CommunityPass } from "@/app/community/community.mock";

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
  }));
  // 이용권 — studio.passPlans를 community/[id]와 동일한 PracticePassList 형태로 매핑
  const passes: CommunityPass[] = (studio.passPlans ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price ?? 0,
    period: p.expireDateStamp,
    tag: p.tag ?? (p.isRecommended ? popularLabel : undefined),
  }));
  const hasPasses = passes.length > 0;
  // 건물 편의시설 — enabled만 (홀 자체 시설은 홀 정보 시트에서 별도 표시)
  const amenities = (studio.amenities ?? []).filter((a) => a.enabled);

  return (
    <ScrollContainer className="w-full h-screen bg-white flex flex-col pb-32 box-border overflow-y-auto no-scrollbar studio-detail-container">
      {/* 헤더 백버튼 — 앱에서만 노출 (웹은 MobileWebViewTopBar가 처리) */}
      {appVersion !== '' && (
        <NavigateClickWrapper method={'back'}>
          <button
            type="button"
            aria-label="뒤로가기"
            className={[
              'absolute left-3 z-10',
              // 큰 터치 타깃 + 반투명 배경
              'inline-flex h-10 w-10 items-center justify-center rounded-full',
              'backdrop-blur text-white shadow mt-10',
            ].join(' ')}
          >
            <LeftArrow className="h-5 w-5"/>
          </button>
        </NavigateClickWrapper>
      )}
      {/* 수업 썸네일 */}
      <div
        style={{backgroundImage: `url(${studio.coverImageUrl ?? studio.profileImageUrl})`}}
        className="
            w-full
            relative
            aspect-[1/1]

            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-[65%]
            before:to-white
            before:to-100%
            before:z-25"
      >
        <div className="w-full pl-6 box-border items-center gap-3 inline-flex absolute bottom-0 z-20">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={studio.profileImageUrl}
              alt="studio logo"
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-col justify-center items-start gap-2 inline-flex">
            <div className="text-[#131517] text-xl font-bold leading-normal">{studio.name}</div>
          </div>

        </div>
      </div>

      {/* 상세 영역 — 헤더(주소/SNS) 아래, 모든 섹션은 회색 구분선 + 동일 상단여백(pt-6)으로 통일 */}
      <div className="flex flex-col mt-6">
        <div className="flex flex-row items-center px-6 gap-2">
          <LocationIcon className="flex-shrink-0"/>
          <div className="text-[#505356] text-[14px] font-medium">{studio.address}</div>
        </div>

        <div className="self-stretch px-6 justify-start items-center gap-2 inline-flex py-3">
          {studio.instagramAddress && <StudioIcon type={'instagram'} url={studio.instagramAddress} appVersion={appVersion}/>}
          {studio.youtubeUrl && <StudioIcon type={'youtube'} url={studio.youtubeUrl} appVersion={appVersion}/>}
        </div>

        {/* 배너 */}
        {studio.banners && studio.banners.length > 0 && (
          <section className="mt-2">
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

        {/* 시간표 — 진행중인 수업이 있을 때만 */}
        {hasLessons && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <TimeTableServerComponent studioId={studio.id} useSheet noMargin/>
          </>
        )}

        {/* YouTube */}
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

        {/* 이용권 */}
        {hasPasses && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <section className="px-4 pt-6">
              <h2 className="text-[20px] font-bold text-black mb-3">{await translate('community_pass')}</h2>
              <PracticeActionProvider>
                <PracticePassList passes={passes} studioId={studio.id} locale={locale} />
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

        {/* 홀(연습실) 예약현황 */}
        {hasHalls && (
          <>
            <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>
            <section className="pt-6">
              <PracticeHallSection practiceRooms={studio.practiceRooms} locale={locale} />
            </section>
          </>
        )}
      </div>

    </ScrollContainer>
  );
}