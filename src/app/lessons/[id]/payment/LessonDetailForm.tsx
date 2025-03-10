'use server'
import { HeaderInDetail } from "@/app/components/headers";
import { StudioProfileImage } from "@/app/lessons/[id]/StudioProfileImage";
import { LessonTypes, LessonTypesDisplay } from "@/entities/lesson/lesson";
import { LessonArtistItem } from "@/app/lessons/[id]/lesson.artist.item";
import { isPastTime } from "@/app/lessons/[id]/time.util";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { LessonInfoSection } from "@/app/lessons/[id]/lesson.info.section";
import { translate } from "@/utils/translate";
import { LessonPaymentButton } from "@/app/lessons/[id]/lesson.payment.button";

export default async function LessonDetailForm({lesson} : {lesson: GetLessonResponse}) {
  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto no-scrollbar">
      {/* 헤더 */}
      <HeaderInDetail title={lesson.title} />

      {/* 수업 썸네일 */}
      <div
        style={{ backgroundImage: `url(${lesson.thumbnailUrl})` }}
        className="
            w-full
            relative
            aspect-[3/2]

            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-70%
            before:to-white
            before:to-100%
            before:z-[2]"
      />

      {/* 디테일 영역 */}
      <div className="w-full py-5 flex-col justify-start items-start gap-8 inline-flex">
        <div className="self-stretch flex-col justify-start items-start gap-0 flex">
          {/* 수업명 */}
          <div className="self-stretch px-6 flex-col justify-start items-start gap-2.5 flex">
            <div className="self-stretch justify-between items-start inline-flex">
              {lesson.studio && <StudioProfileImage studio={lesson.studio}/>}
              <div className="justify-center items-start gap-[3px] flex">
                <div
                  className="self-stretch px-2 py-1 bg-black rounded-xl justify-center items-center gap-2.5 inline-flex">
                  <div className="text-white text-xs font-medium leading-none">{lesson.level}</div>
                </div>
                <div
                  className="self-stretch px-2 py-1 rounded-xl border border-[#d7dadd] justify-center items-center gap-2.5 inline-flex">
                  <div
                    className="text-[#86898c] text-xs font-medium leading-none">{LessonTypesDisplay[lesson.type ?? LessonTypes.PopUp]}</div>
                </div>
              </div>
            </div>
            <div className="self-stretch justify-start items-center gap-2 inline-flex">
              <div className="w-[342px] text-black text-xl font-bold leading-normal">{lesson.title}</div>
            </div>
            <div className="w-full h-[1px] bg-[#f7f8f9]"/>
          </div>


          {/* 상세 */}
          <LessonInfoSection data={lesson}/>

          <div className="w-full h-3 bg-[#f7f8f9]"/>
        </div>

        {/* 강사 */}
        <div className="self-stretch flex-col justify-start items-start gap-5 flex">
          <div className="self-stretch h-7 px-6 justify-center items-center gap-5 inline-flex">
            <div className="grow shrink basis-0 text-black text-[16px] font-bold leading-snug">{await translate('lesson_information')}</div>
          </div>
          {lesson.artist && <LessonArtistItem artist={lesson.artist}/>}
          {lesson.extraArtists && lesson.extraArtists.length > 0 && (
            <div className="flex flex-col gap-5">
              {lesson.extraArtists.map((artist, index) => (
                <LessonArtistItem
                  key={artist.id || index}
                  artist={artist}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 결제 페이지 이동 버튼 */}
      <div className="left-0 w-full h-fit fixed bottom-2 px-6">
        <LessonPaymentButton id={lesson.id} ticketData={lesson.ticket} disabled={isPastTime(lesson.startTime)}/>
      </div>
    </div>
  );
}