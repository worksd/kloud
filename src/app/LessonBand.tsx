import { BandLabel, BandType, GetBandLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import React from "react";
import { RecommendPoster } from "@/app/components/RecommendPoster";
import ComingLabel from "../../public/assets/ic_label_comming.svg";
import NewLabel from "../../public/assets/new.svg";
import { resolveBandEvent } from "@/app/lib/analytics";

export async function LessonBand({title, lessons, type, label}: {
  title: string,
  lessons: GetBandLessonResponse[],
  type: BandType,
  label?: BandLabel,
}) {

  if (lessons.length == 0) return;

  // 밴드 종류에 따라 클릭 이벤트 이름이 갈린다. 어떤 수업을 몇 번째에서 눌렀는지는 custom data로.
  const bandEvent = resolveBandEvent({ type, label, title });

  return (
    <div className="flex flex-col mb-2">
      {label?.coming && (
        <div className="px-6 pt-3">
          <ComingLabel className="h-[16px] w-auto" />
        </div>
      )}
      {label?.new && (
        <div className="px-6 pt-3">
          {/* SVG native 52x17 — SVGR가 width/height 속성을 박아서 CSS와 충돌하므로 React props로 직접 지정 */}
          <NewLabel width={52} height={17} style={{ display: 'block' }} />
        </div>
      )}
      <h2 className={`text-[18px] text-black font-bold leading-tight ${(label?.coming || label?.new) ? 'pt-[4px]' : 'pt-5'} pb-2 px-6`}>{title}</h2>
      <div className="flex overflow-x-auto scrollbar-hide gap-2">
        {lessons.map((item: GetBandLessonResponse, index: number) => (
          <div
            key={item.id}
            className={index === 0 ? 'pl-5' : index === lessons.length - 1 ? 'pr-5' : ''}
          >
            {type == 'Default' &&
              <Poster
                width={167}
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                title={item.title}
                description={item.description ?? ''}
                date={item.date}
                startTime={item.startTime}
                startDate={item.startDate}
                studioName={item.studioName}
                studioImageUrl={item.studioImageUrl}
                label={item.label}
                type={item.type}
                tags={item.label?.tags ?? undefined}
                track={{ event: bandEvent, props: { lessonId: item.id, bandTitle: title, position: index } }}
              />
            }
            {
              type == 'Recommendation' &&
              <RecommendPoster
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                date={item.description ?? ''}
                lessonDate={item.date}
                startTime={item.startTime}
                startDate={item.startDate}
                title={item.title ?? ''}
                type={item.type}
                track={{ event: bandEvent, props: { lessonId: item.id, bandTitle: title, position: index } }}
              />
            }
          </div>
        ))}
      </div>
    </div>
  );
};
