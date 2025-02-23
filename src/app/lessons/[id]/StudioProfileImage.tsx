'use client'
import Image from "next/image";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";

export const StudioProfileImage = ({studio}: {studio?: GetStudioResponse}) => {
  return (
    <Image
      className="relative rounded-full border border-[#f7f8f9] w-6 h-6 box-border object-cover object-center"
      src={studio?.profileImageUrl ?? ''}
      alt={`${studio?.name} 스튜디오`}
      width={24}
      height={24}
      onClick={() => window.KloudEvent.push(KloudScreen.StudioDetail(studio?.id ?? 0))}
    />
  )
}