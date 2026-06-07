// PC 전용 스튜디오 상세. 모바일은 studio.detail.tsx 사용.
// 레이아웃: 상단 cover 배너 + 2-column (좌: 컨텐츠 / 우: sticky 정보 카드 + 패스권 구매 버튼)

import Image from "next/image";
import LocationIcon from "../../../../public/assets/location.svg";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanPurchaseSubmitButton } from "@/app/lessons/[id]/PassPlanPurchaseSubmitButton";
import { StudioIcon } from "@/app/studios/[id]/StudioIcon";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { YoutubeContentSection } from "@/app/studios/[id]/YoutubeContentSection";
import { getYoutubeContents } from "@/app/studios/[id]/get.youtube.contents.action";
import { KloudScreen } from "@/shared/kloud.screen";

export const StudioDetailPcForm = async ({id, appVersion}: { id: number, appVersion: string }) => {

  const studio = await getStudioDetail(id);
  if (!('id' in studio)) return notFound();

  const youtubeContents = await getYoutubeContents(studio.youtubeChannelKey);
  const locale = await getLocale();
  const lessons = studio.lessons ?? [];

  return (
    <div className="w-full min-h-screen bg-white pt-16 pb-32">
      {/* pt-16: WebTopNav 아래 */}

      {/* 상단 cover 배너 — 21:9, max-w-6xl 안쪽 */}
      <div className="mx-auto w-full max-w-6xl px-8">
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-[#F1F3F6]">
          <Image
            src={studio.coverImageUrl ?? studio.profileImageUrl}
            alt={studio.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white border-2 border-white shadow-md shrink-0">
                <Image
                  src={studio.profileImageUrl}
                  alt={studio.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="text-[28px] font-bold text-white leading-tight truncate">{studio.name}</h1>
                {studio.address && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <LocationIcon className="flex-shrink-0 w-3.5 h-3.5"/>
                    <span className="text-[13px] font-medium truncate">{studio.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-column 본문 */}
      <div className="mx-auto w-full max-w-6xl px-8 mt-10 grid grid-cols-[minmax(0,1fr)_340px] gap-x-10">

        {/* 좌측 컨텐츠 */}
        <div className="col-start-1 row-start-1 flex flex-col gap-10 min-w-0">

          {/* 배너 — 가로 스크롤 */}
          {studio.banners && studio.banners.length > 0 && (
            <section>
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 -mx-1 px-1">
                {studio.banners.map((banner) => {
                  const isExpired = new Date(banner.endDate) < new Date();
                  if (isExpired) return null;
                  return (
                    <NavigateClickWrapper key={banner.id} method="push" route={banner.route}>
                      <div className="min-w-[480px] snap-start">
                        <div className="w-full aspect-[32/9] relative rounded-2xl overflow-hidden">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.description || '배너'}
                            fill
                            className="object-cover"
                            sizes="480px"
                          />
                        </div>
                      </div>
                    </NavigateClickWrapper>
                  );
                })}
              </div>
            </section>
          )}

          {/* 타임테이블 */}
          <section>
            <TimeTableServerComponent studioId={studio.id}/>
          </section>

          {/* 공지 — 최대 5개. 초과 시 더보기 버튼으로 전체 목록(/announcements) 이동 */}
          {studio.announcements && studio.announcements.length > 0 && (
            <section>
              <h2 className="text-[20px] text-black font-bold mb-4">{await translate('studio_announcement')}</h2>
              <div className="flex flex-col gap-3">
                {studio.announcements.slice(0, 5).map((item: GetAnnouncementResponse) => (
                  <div key={item.id} className="bg-[#F7F8F9] p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={studio.profileImageUrl} alt={studio.name} className="w-full h-full object-cover"/>
                      </div>
                      <span className="font-bold text-black text-[14px]">{studio.name}</span>
                    </div>
                    <p className="text-[#667085] text-[14px] leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              {studio.announcements.length > 5 && (
                <div className="mt-5 text-center">
                  <NavigateClickWrapper method="push" route={KloudScreen.AnnouncementList(studio.id)}>
                    <span className="inline-block px-5 py-2.5 rounded-full border border-[#dcdee0] text-[13px] font-semibold text-black hover:border-black transition-colors cursor-pointer">
                      {await translate('more')}
                    </span>
                  </NavigateClickWrapper>
                </div>
              )}
            </section>
          )}

          {/* YouTube */}
          {youtubeContents.length > 0 && (
            <section>
              <YoutubeContentSection
                contents={youtubeContents}
                title="최근 YouTube 영상"
                channelUrl={studio.youtubeUrl}
                locale={locale}
              />
            </section>
          )}

          {/* 진행중인 수업 — PC 자체 3-column 그리드 (LessonGridSection은 w-screen이라 PC 부적합) */}
          {lessons.length > 0 && (
            <section>
              <h2 className="text-[20px] text-black font-bold mb-4">{await translate('ongoing_lessons')}</h2>
              <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                {lessons.slice(0, 9).map((l) => (
                  <NavigateClickWrapper key={l.id} method="push" route={KloudScreen.LessonDetail(l.id)}>
                    <div className="flex flex-col gap-2 cursor-pointer group">
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#F1F3F6]">
                        {l.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.thumbnailUrl}
                            alt={l.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-black truncate">{l.title}</span>
                      <span className="text-[12px] text-[#86898C] truncate">
                        {(l.artists?.[0]?.nickName ?? l.artists?.[0]?.name) ?? l.artist?.nickName ?? ''}
                      </span>
                    </div>
                  </NavigateClickWrapper>
                ))}
              </div>
              {lessons.length > 9 && (
                <div className="mt-6 text-center">
                  <NavigateClickWrapper method="push" route={KloudScreen.StudioLessons(studio.id)}>
                    <span className="inline-block px-5 py-2.5 rounded-full border border-[#dcdee0] text-[13px] font-semibold text-black hover:border-black transition-colors cursor-pointer">
                      {await translate('more')}
                    </span>
                  </NavigateClickWrapper>
                </div>
              )}
            </section>
          )}
        </div>

        {/* 우측 sticky 정보 카드 — 위치는 cover 배너에 이미 표기됨, SNS + 패스권 버튼만 */}
        <aside className="col-start-2 row-start-1 sticky top-24 self-start">
          <div className="rounded-2xl border border-[#f0f1f3] bg-white p-5 flex flex-col gap-4 shadow-sm">
            {(studio.instagramAddress || studio.youtubeUrl) && (
              <>
                <div className="flex items-center gap-2">
                  {studio.instagramAddress && (
                    <StudioIcon type={'instagram'} url={studio.instagramAddress} appVersion={appVersion}/>
                  )}
                  {studio.youtubeUrl && (
                    <StudioIcon type={'youtube'} url={studio.youtubeUrl} appVersion={appVersion}/>
                  )}
                </div>
                <div className="h-px bg-[#f0f1f3]"/>
              </>
            )}

            {/* 패스권 구매 — sticky 우측 column 내부에 inline 배치 (모바일의 fixed bottom 대체) */}
            <PassPlanPurchaseSubmitButton studioId={studio.id}/>
          </div>
        </aside>
      </div>
    </div>
  );
}
