'use client'

import React, { useState } from "react";
import Image from "next/image";
import { LessonGroupSummary } from "@/app/endpoint/studio.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const INITIAL_COUNT = 4;

export const LessonGroupBand = ({ lessonGroups, locale }: {
  lessonGroups: LessonGroupSummary[];
  locale: Locale;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (lessonGroups.length === 0) return null;

  const visibleItems = expanded ? lessonGroups : lessonGroups.slice(0, INITIAL_COUNT);
  const hasMore = lessonGroups.length > INITIAL_COUNT;

  return (
    <div className="flex flex-col mb-2">
      <h2 className="text-[18px] text-black font-bold pt-5 pb-3 px-6">
        {getLocaleString({ locale, key: 'my_lesson_group_tickets' })}
      </h2>
      <div className="flex flex-col gap-3 px-6">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            onClick={() => kloudNav.push(KloudScreen.LessonGroupDetail(item.id))}
            className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity"
          >
            <div className="w-[56px] h-[56px] rounded-xl overflow-hidden bg-[#F1F3F6] flex-shrink-0">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F1F3F6]" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold text-black truncate">{item.title}</span>
              <span className="text-[12px] text-[#86898C] mt-0.5">{item.description}</span>
              {item.label?.genre && item.label.genre !== 'Default' && (
                <span className="text-[11px] text-[#999] mt-0.5">{item.label.genre}</span>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M6 4L10 8L6 12" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mx-6 mt-3 py-2.5 rounded-xl border border-[#E6E8EA] text-[13px] font-medium text-[#666] active:bg-[#F7F8F9] transition-colors"
        >
          {getLocaleString({ locale, key: 'more' })}
        </button>
      )}
    </div>
  );
};
