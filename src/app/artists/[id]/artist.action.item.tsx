'use client';

import InstagramGrayIcon from '../../../../public/assets/instagram-gray.svg';
import YoutubeGrayIcon from '../../../../public/assets/youtube-gray.svg';
import TiktokGrayIcon from '../../../../public/assets/tiktok-gray.svg';
import HeartEmptyIcon from '../../../../public/assets/heart-empty.svg';
import { GetArtistResponse } from '@/app/endpoint/artist.endpoint';

export const ArtistActionItem = ({artist, appVersion}: {
  artist: GetArtistResponse;
  appVersion: string
}) => {
  const handleSnsClick = (url: string) => {
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  }
  {/* 하단 오버레이: 닉네임 + 좋아요 + SNS */
  }
  return (
    <div className="absolute inset-x-0 bottom-0 px-6 flex flex-col-reverse justify-start gap-0 z-[2]">
      {/* 2행: SNS (있을 때만 렌더) — 최하단에 맞닿음 */ }
      { (artist.instagramAddress || artist.youtubeAddress || artist.tiktokAddress) && (
        <div className="w-full flex items-center gap-3">
          { artist.instagramAddress && (
            <InstagramGrayIcon
              onClick={ () => handleSnsClick(`https://www.instagram.com/${ artist.instagramAddress }`) }/>
          ) }
          { artist.youtubeAddress && (
            <YoutubeGrayIcon onClick={ () => handleSnsClick(`https://www.youtube.com/${ artist.youtubeAddress }`) }/>
          ) }
          { artist.tiktokAddress && (
            <TiktokGrayIcon onClick={ () => handleSnsClick(`https://www.tiktok.com/@${ artist.tiktokAddress }`) }/>
          ) }
        </div>
      ) }
      {/* 1행: 닉네임(좌) + 좋아요(우) */ }
      <div className="w-full flex items-center justify-between">
        <div
          className="text-black text-[48px] leading-[72px] font-semibold"
          style={ {letterSpacing: '-0.408px', fontFamily: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system'} }
        >
          { artist.nickName }
        </div>

        {/* TODO: 좋아요 response에 따라 바뀌게 처리하기 */}
        <div className="flex flex-col items-center ml-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <HeartEmptyIcon/>
          </div>
          <div className="text-[#3E3E3E] text-[12px] font-medium leading-[14px] mt-[1px]">
            좋아요
          </div>
        </div>
      </div>
    </div>
  )
}