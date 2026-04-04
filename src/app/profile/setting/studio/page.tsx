import { api } from "@/app/api.client";
import React from "react";
import { StudioSettingForm } from "@/app/profile/setting/studio/StudioSettingForm";
import { translate } from "@/utils/translate";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

export default async function StudioSettingPage() {
  const res = await api.studio.my({});
  const selectedStudioId = (await cookies()).get(studioKey)?.value
    ?? ('studios' in res && res.studios.length > 0 ? `${res.studios[0].id}` : undefined);

  if ('studios' in res && res.studios.length > 0) {
    return (
      <StudioSettingForm
        studios={res.studios}
        currentStudioId={selectedStudioId}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center">
      <span className="text-[14px] text-[#AEAEAE]">{await translate('no_studio')}</span>
    </div>
  );
}
