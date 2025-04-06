import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { api } from "@/app/api.client";
import { translate } from "@/utils/translate";
import { AnnouncementBand } from "@/app/home/@my/announcement.band";

export default async function MyHomeContents() {
  const res = await api.user.me({})
  if (!('id' in res)) throw Error()
  return (
    <div>
      <section className="mt-4">
        <LessonBand title={await translate('live_popular_lessons')} lessons={res.lessons ?? []} type={'Default'}/>

        {res.lessons?.length == 0 && (
          <div className="w-full text-center text-[#BCBFC2] py-10">
            <p className="text-lg mb-2 text-black font-medium">{await translate('no_upcoming_lesson_title')}</p>
            <p className="text-sm text-gray-400">
              {await translate('no_upcoming_lesson_message')}
            </p>
          </div>
        )}
      </section>


      <section>
        {res.announcements.length > 0 && (
          <div className="flex flex-col">
            <div className="p-4">
              <div className="text-[20px] text-black font-bold">
                {await translate('studio_announcement')}
              </div>
            </div>
            <AnnouncementBand announcements={res.announcements}/>
          </div>
        )}
      </section>

    </div>
  )
}