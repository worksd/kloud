import { api } from "@/app/api.client";
import SnsButton from "@/app/components/buttons/SnsButton";
import { HeaderInDetail } from "@/app/components/headers";
import { extractNumber } from "@/utils";

import Instagram from "../../../../public/assets/instagram-colored.svg";
import Youtube from "../../../../public/assets/youtube-colored.svg";
import LocationIcon from "../../../../public/assets/location.svg"
import PhoneIcon from ".././../../../public/assets/phone.svg"
import Divider from "./studio.divider";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import { NotificationList } from "@/app/home/notification.list";
import Image from "next/image";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StudioDetail({params}: Props) {
  const id = (await params).id;
  const res = await api.studio.get({id: extractNumber(id)});
  if ("code" in res) {
    console.error(res.message);
    return <div className="text-black">에러~</div>;
  }

  const [address, _] = res.address.split("/");

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
      {/* 헤더 */}
      <HeaderInDetail title={res.name}/>

      {/* 수업 썸네일 */}
      <div
        style={{backgroundImage: `url(${res.coverImageUrl ?? res.profileImageUrl})`}}
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
            before:z-[2]"
      >
        <div className="w-full pl-6 box-border items-center gap-3 inline-flex absolute bottom-0 z-20">
          <Image src="https://picsum.photos/250/250" alt={"studio logo"} width={60} height={60} className="rounded-full"/>
          <div className="flex-col justify-center items-start gap-2 inline-flex">
            <div className="text-[#131517] text-xl font-bold leading-normal">{res.name}</div>

            <button className="px-2.5 py-1 bg-black rounded-[999px] justify-center items-center gap-2.5 inline-flex">
              <div className="text-center text-white text-sm font-medium leading-tight">팔로우</div>
            </button>
          </div>
        </div>
      </div>

      {/* 상세 영역 */}
      <div className="w-full flex flex-col justify-start items-start gap-2 mt-6">
        <div className="self-stretch px-6 py-0.5 box-border justify-between items-center flex">
          <div className="justify-start items-center gap-1 flex">
            <LocationIcon/>
            <div className="text-center text-[#505356] text-sm font-medium leading-tight">{address}</div>
          </div>
        </div>

        <div className="justify-start items-center gap-1 flex px-6">
          <PhoneIcon/>
          <div className="text-center text-[#505356] text-sm font-medium leading-tight">{res.phone}</div>
        </div>

        <div className="self-stretch px-6 justify-start items-center gap-2 inline-flex">
          {res.instagramAddress && <SnsButton link={res.instagramAddress} logoPath={Instagram} alt="instagram"/>}
          {res.youtubeUrl && <SnsButton link={res.youtubeUrl} logoPath={Youtube} alt="youtube"/>}
        </div>

        <div>
          <div className="w-full h-1 bg-[#f7f8f9]"/>
          {/*<NotificationList title=""/>*/}
        </div>

        <div>
          <div className="w-full h-3 bg-[#f7f8f9]"/>
          <div className="mt-10">
            {res.lessons.length > 0 && (
              <LessonGridSection title="Hot" lessons={res.lessons}
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
