// PC 전용 스튜디오 상세 — 모바일·앱 웹뷰는 studio.detail.tsx 사용. 분기는 page.tsx에서 appVersion + viewport(lg)로.
// 모바일 상세의 알짜 섹션(공지 아코디언·홀 예약현황·이용권 목록·편의시설·주소 지도링크)을 그대로 흡수하고,
// PC 장점(2-column, sticky 이용권 카드, 수업 3열 그리드)을 얹은 구성.
// 레이아웃: 상단 21:9 커버 + 좌(공지/배너/시간표/수업/YouTube/홀/편의시설) + 우 sticky 이용권 카드

import Image from "next/image";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanPurchaseSubmitButton } from "@/app/lessons/[id]/PassPlanPurchaseSubmitButton";
import { StudioIcon } from "@/app/studios/[id]/StudioIcon";
import { StudioAddressLink } from "@/app/studios/[id]/StudioAddressLink";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { YoutubeContentSection } from "@/app/studios/[id]/YoutubeContentSection";
import { getYoutubeContents } from "@/app/studios/[id]/get.youtube.contents.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { PracticeNoticeList } from "@/app/studios/[id]/practice/PracticeNoticeList";
import { PracticeHallSection } from "@/app/studios/[id]/practice/PracticeHallSection";
import { StudioPassList } from "@/app/studios/[id]/practice/StudioPassList";
import { PracticeActionProvider } from "@/app/studios/[id]/practice/PracticeActionBar";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";
import { CommunityNotice, CommunityPass } from "@/app/community/community.mock";
import { formatRuleDescription } from "@/utils/pass.description";
import { LessonRelativeDate } from "@/app/components/LessonRelativeDate";

export const StudioDetailPcForm = async ({id, appVersion}: { id: number, appVersion: string }) => {

  const studio = await getStudioDetail(id);
  if (!('id' in studio)) return notFound();

  const youtubeContents = await getYoutubeContents(studio.youtubeChannelKey);
  const locale = await getLocale();
  const lessons = studio.lessons ?? [];
  const hasHalls = (studio.practiceRooms?.length ?? 0) > 0;
  const popularLabel = await translate('popular');

  // ↓ 매핑 규칙은 모바일(studio.detail.tsx)과 동일 — 같은 데이터가 두 폼에서 다르게 보이면 안 된다
  const notices: CommunityNotice[] = (studio.announcements ?? []).map((a) => ({
    title: a.title,
    content: a.body,
    imageUrl: a.imageUrl ?? undefined,
    createdAt: a.createdAt ?? undefined,
  }));
  const passes: CommunityPass[] = (studio.passPlans ?? []).map((p) => {
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
  const amenities = (studio.amenities ?? []).filter((a) => a.enabled);

  return (
    <div className="w-full min-h-screen bg-white pt-10 pb-32">
      {/* 상단 cover 배너 — 21:9, max-w-6xl 안쪽 */}
      <div className="mx-auto w-full max-w-6xl px-8">
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-[#F1F3F6]">
          <Image
            src={studio.coverImageUrl ?? studio.profileImageUrl}
            alt={studio.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
            // priority 금지 — lg 미만(모바일 웹)에선 숨겨진 PC용 이미지까지 preload하게 된다
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
                {/* 주소 — 모바일과 동일하게 클릭 시 지도 링크. 어두운 커버 위라 흰색으로 반전 */}
                {studio.address && (
                  <div className="[&_button]:!text-white/90 [&_button]:text-[13px]">
                    <StudioAddressLink address={studio.address} appVersion={appVersion} />
                  </div>
                )}
              </div>
            </div>

            {/* SNS — 스튜디오명 반대편(우하단), 커버 위 흰 칩 */}
            {(studio.instagramAddress || studio.youtubeUrl) && (
              <div className="flex items-center gap-2 shrink-0">
                {studio.instagramAddress && (
                  <StudioIcon type={'instagram'} url={studio.instagramAddress} appVersion={appVersion} variant="overlay"/>
                )}
                {studio.youtubeUrl && (
                  <StudioIcon type={'youtube'} url={studio.youtubeUrl} appVersion={appVersion} variant="overlay"/>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-column 본문 */}
      <div className="mx-auto w-full max-w-6xl px-8 mt-10 grid grid-cols-[minmax(0,1fr)_340px] gap-x-10">

        {/* 좌측 컨텐츠 */}
        <div className="col-start-1 row-start-1 flex flex-col gap-10 min-w-0">

          {/* 공지 — 모바일과 동일한 아코디언(펼치기) UI */}
          {notices.length > 0 && (
            <section>
              <h2 className="text-[20px] text-black font-bold mb-3">{await translate('studio_announcement')}</h2>
              <PracticeNoticeList notices={notices} studioId={studio.id} locale={locale} />
            </section>
          )}

          {/* 배너 — 컬럼 폭 꽉 채움 + snap 스와이프.
              NavigateClickWrapper가 폭 클래스 없는 div라 [&>div]로 flex item에 직접 min-w-full을 건다
              (안쪽에 걸면 부모 폭이 content 기반이라 붕괴). */}
          {studio.banners && studio.banners.length > 0 && (
            <section>
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 [&>div]:w-full [&>div]:min-w-full [&>div]:snap-start">
                {studio.banners.map((banner) => {
                  const isExpired = new Date(banner.endDate) < new Date();
                  if (isExpired) return null;
                  return (
                    <NavigateClickWrapper key={banner.id} method="push" route={banner.route}>
                      <div className="w-full aspect-[32/9] relative rounded-2xl overflow-hidden cursor-pointer">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.description || '배너'}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 720px, 100vw"
                        />
                      </div>
                    </NavigateClickWrapper>
                  );
                })}
              </div>
            </section>
          )}

          {/* 타임테이블 — TimeTable 내부 px-4는 -mx-4로 상쇄해 다른 섹션과 좌측 라인을 맞추고,
              내부 헤더 mt-6은 -mt-6으로 상쇄해 컬럼 gap-10 리듬을 유지한다 (noMargin: 내부 my-4 제거) */}
          <section className="-mx-4 -mt-6">
            <TimeTableServerComponent studioId={studio.id} noMargin/>
          </section>

          {/* 진행중인 수업 — PC 자체 3-column 그리드 (모바일 LessonBookingList는 바텀시트 흐름이라 PC에선 상세 이동) */}
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
                      {/* 수업 시각 — 모바일(LessonBookingList)과 동일한 상대 시각(오늘/내일/이번 주 …).
                          '지금' 기준 계산이라 서버(UTC)에서 하면 KST와 어긋난다 — 클라이언트 leaf로 렌더 */}
                      <LessonRelativeDate
                        when={l}
                        locale={locale}
                        className="text-[12px] font-medium text-[#4E5968] truncate"
                      />
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

          {/* 홀(연습실) 예약현황 — 모바일과 동일 컴포넌트. 내부 px-4를 -mx-4로 상쇄해 h2·카드가 컬럼 라인에 정렬 */}
          {hasHalls && (
            <section className="-mx-4">
              <PracticeHallSection studioId={studio.id} practiceRooms={studio.practiceRooms} locale={locale} pcSheet />
            </section>
          )}

          {/* 편의시설 — 건물 시설(enabled만), 모바일과 동일 칩 */}
          {amenities.length > 0 && (
            <section>
              <h2 className="text-[20px] text-black font-bold mb-3">{await translate('community_amenities')}</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a.amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8F9] border border-[#EEF0F2] text-[13px] font-medium text-[#333]">
                    <PracticeAmenityIcon name={a.label} className="w-4 h-4 shrink-0" />
                    {a.label}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 우측 sticky 카드 — 이용권 목록(선택 → 하단 구매 액션바, 모바일과 동일 흐름).
            이용권이 없으면 패스권 구매 진입 버튼 폴백. top-20: sticky 상단바(h-16) 아래 여백 */}
        <aside className="col-start-2 row-start-1 sticky top-20 self-start">
          <div className="rounded-2xl border border-[#f0f1f3] bg-white p-5 shadow-sm flex flex-col gap-4">
            {passes.length > 0 ? (
              <>
                <h2 className="text-[17px] font-bold text-black">{await translate('community_pass')}</h2>
                {/* Provider는 StudioPassList의 훅 요구사항 충족용 — directPayment라 액션바는 뜨지 않는다 */}
                <PracticeActionProvider>
                  <StudioPassList passes={passes} studioId={studio.id} locale={locale} directPayment />
                </PracticeActionProvider>
              </>
            ) : (
              <PassPlanPurchaseSubmitButton studioId={studio.id}/>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
