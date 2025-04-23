'use client'
import Image from "next/image";
import { GetArtistResponse } from "@/app/endpoint/lesson.endpoint";
import InstagramIcon from "../../../../public/assets/instagram-colored.svg"

export const LessonArtistItem = ({artist}: { artist: GetArtistResponse }) => {
  return (
    <div className="self-stretch h-9 px-6 flex-col justify-start items-start gap-4 flex">
      <div className="self-stretch justify-between items-center inline-flex">
        <div className="flex items-center gap-3">
          <Image
            className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0"
            src={artist.profileImageUrl}
            alt={`${artist?.nickName} 강사`}
            width={36}
            height={36}
          />
          <div className="text-black text-sm font-bold leading-tight">{artist.nickName}</div>
        </div>

        {artist.instagramAddress && (
          <div
            className={'w-[24px] h-[24px]'}
            onClick={() => window.KloudEvent.openExternalBrowser(`https://www.instagram.com/${artist.instagramAddress}`)}>
            <InstagramIcon />
          </div>
        )}
      </div>
    </div>
  );
}