'use client'

import { useEffect, useState } from "react";
import { calculateDDays } from "@/utils";
import { formatDateTime } from "@/utils/date.format";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import { translate } from "@/utils/translate";
import Image from "next/image";
import { TranslatableText } from "@/utils/TranslatableText";

export function ClientPoster({
                               id,
                               posterUrl,
                               studioLogoUrl,
                               startTime,
                               title,
                               width = 160
                             }: {
  id: number,
  posterUrl: string,
  studioLogoUrl?: string,
  startTime: string,
  title?: string,
  width?: number
}) {
  const d_days = calculateDDays(startTime);

  const [dayOfWeek, setDayOfWeek] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchFormatTime = async () => {
      const formatTime = await formatDateTime(startTime);
      setDayOfWeek(await translate(formatTime.dayOfWeek));
      setDate(formatTime.date);
      setTime(formatTime.time);
    };

    fetchFormatTime();
  }, []);

  if (!mounted) return;

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.LessonDetail(id)}>
      <div
        className="flex flex-col active:scale-[0.98] transition-transform duration-150"
        style={{ width: `${width}px` }}
      >
        <div className="relative overflow-hidden">
          <Thumbnail
            className="relative z-0 object-cover w-full"
            width={width}
            url={posterUrl}
          />

          {d_days ? (
            <div className="absolute py-1 px-2 bottom-0 right-0 mb-2 mr-2 text-white bg-[#00000099] text-[12px] text-center font-semibold rounded-[999px]">
              {d_days}
            </div>
          ) : (
            <div className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px] rounded-b-[16px]">
              <TranslatableText titleResource={'finish'}/>
            </div>
          )}

          {studioLogoUrl && (
            <Image
              className="absolute left-0 top-0 mt-2 ml-2 w-[24px] h-[24px] rounded-full flex-shrink-0"
              src={studioLogoUrl}
              alt="로고 URL"
              width={24}
              height={24}
            />
          )}
        </div>

        <div className="ml-1 w-full">
          <div
            className="body-400 mt-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </div>
          {title && (
            <div className="body-200 text-gray-500 truncate">
              {`${date}(${dayOfWeek}) ${time}`}
            </div>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  );
}