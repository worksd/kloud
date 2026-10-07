'use client';

import React, { useState } from "react";
import { TopTabs } from "@/app/components/TopTabs";
import { StudioRegularClassList } from "@/app/studios/[id]/StudioRegularClassList";
import { StudioPassList } from "@/app/studios/[id]/practice/StudioPassList";
import { PracticeActionProvider } from "@/app/studios/[id]/practice/PracticeActionBar";
import { StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { CommunityPass } from "@/app/community/community.mock";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export type StudioProgramTab = 'regularClass' | 'pass';

/**
 * 스튜디오 정규반·패스권 전체 목록 — 상단 탭으로 나눠 한 페이지에서.
 * 두 목록은 서버가 병렬로 미리 가져와 넘기므로 탭 전환은 즉시. 선택한 탭은 ?tab= 에 replace 해 둬
 * 뒤로가기/새로고침/딥링크에서 같은 탭이 열린다.
 */
export function StudioProgramsTabs({ studioId, studioImageUrl, regularClasses, passes, initialTab, locale }: {
  studioId: number;
  studioImageUrl?: string;
  regularClasses: StudioRegularClassResponse[];
  passes: CommunityPass[];
  initialTab: StudioProgramTab;
  locale: Locale;
}) {
  const [tab, setTab] = useState<StudioProgramTab>(initialTab);
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const onChange = (next: StudioProgramTab) => {
    setTab(next);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(window.history.state, '', url.toString());
  };

  return (
    <div className="flex flex-col">
      <TopTabs<StudioProgramTab>
        className="px-4"
        value={tab}
        onChange={onChange}
        tabs={[
          { key: 'regularClass', label: t('studio_regular_classes') },
          { key: 'pass', label: t('community_pass') },
        ]}
      />

      <div className="px-4 py-4">
        {tab === 'regularClass' ? (
          regularClasses.length > 0 ? (
            <StudioRegularClassList classes={regularClasses} studioId={studioId} studioImageUrl={studioImageUrl} locale={locale} showAll />
          ) : (
            <div className="py-16 text-center text-[14px] text-[#86898C]">{t('regular_class_empty')}</div>
          )
        ) : (
          passes.length > 0 ? (
            // Provider 는 StudioPassList 의 훅 요구사항 충족용 — directPayment 라 액션바는 뜨지 않는다
            <PracticeActionProvider>
              <StudioPassList passes={passes} studioId={studioId} locale={locale} directPayment showAll />
            </PracticeActionProvider>
          ) : (
            <div className="py-16 text-center text-[14px] text-[#86898C]">{t('pass_plan_empty')}</div>
          )
        )}
      </div>
    </div>
  );
}
