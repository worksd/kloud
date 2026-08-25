import { api } from "@/app/api.client";
import React from "react";
import { StudioSettingForm } from "@/app/profile/setting/studio/StudioSettingForm";
import { translate } from "@/utils/translate";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function StudioSettingPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  // 나의 수강 스튜디오 + 전체(추천) 스튜디오 병렬 조회 — 추천 섹션은 내가 수강 중인 스튜디오를 빼고 노출
  const [myRes, allRes] = await Promise.all([
    api.studio.my({}),
    api.studio.list({}),
  ]);

  const myStudios = 'studios' in myRes ? myRes.studios : [];
  const allStudios = 'studios' in allRes ? allRes.studios : [];
  const myIds = new Set(myStudios.map(s => s.id));
  const recommendedStudios = allStudios.filter(s => !myIds.has(s.id));

  const selectedStudioId = (await cookies()).get(studioKey)?.value
    ?? (myStudios.length > 0 ? `${myStudios[0].id}` : undefined);

  const isWeb = appVersion === '' || appVersion == null;
  const title = await translate('studio_setting');

  if (myStudios.length === 0 && recommendedStudios.length === 0) {
    const emptyText = await translate('no_studio');
    return (
      <SettingPcShell
        isWeb={isWeb}
        title={title}
        mobile={
          <div className="flex flex-col min-h-screen bg-white items-center justify-center">
            <span className="text-[14px] text-[#AEAEAE]">{emptyText}</span>
          </div>
        }
      >
        <p className="py-16 text-center text-[14px] text-[#AEAEAE]">{emptyText}</p>
      </SettingPcShell>
    );
  }

  const formProps = {
    myStudios,
    recommendedStudios,
    currentStudioId: selectedStudioId,
    myStudiosLabel: await translate('my_ticket_studio'),
    recommendedStudiosLabel: await translate('recommended_studios'),
  };

  return (
    <SettingPcShell
      isWeb={isWeb}
      title={title}
      flush
      mobile={<StudioSettingForm {...formProps}/>}
    >
      <StudioSettingForm {...formProps} pcCard/>
    </SettingPcShell>
  );
}
