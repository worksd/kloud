'use client'
import Image from "next/image";
import { GetArtistResponse } from "@/app/endpoint/artist.endpoint";
import InstagramIcon from "../../../../public/assets/instagram-colored.svg"
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { KloudScreen } from '@/shared/kloud.screen';

export const LessonArtistItem = ({artist, appVersion}: { artist: GetArtistResponse, appVersion: string }) => {

  const handleInstagramClick = () => {
    const url = `https://www.instagram.com/${artist.instagramAddress}`;
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="self-stretch h-9 px-6 flex-col justify-start items-start gap-4 flex">
      <div className="self-stretch justify-between items-center inline-flex">
        <div className="flex items-center gap-3 cursor-pointer">
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
          <button
            type="button"
            aria-label="Instagram"
            className="w-[24px] h-[24px] inline-flex items-center justify-center"
            onClick={handleInstagramClick}
          >
            <InstagramIcon />
          </button>
        )}
      </div>
    </div>
  );
}