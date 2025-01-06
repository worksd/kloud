import { api } from "@/app/api.client";
import SnsButton from "@/app/components/buttons/SnsButton";
import { HeaderInDetail } from "@/app/components/headers";
import { extractNumber } from "@/utils";

import Instagram from "../../../../public/assets/instagram-colored.svg";
import Youtube from "../../../../public/assets/youtube-colored.svg";
import LocationIcon from "../../../../public/assets/location.svg"
import PhoneIcon from ".././../../../public/assets/phone.svg"
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import Image from "next/image";
import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StudioDetail({params}: Props) {
  const id = (await params).id;

  return (
    <StudioDetailForm id={id}/>
  )
}
