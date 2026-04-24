'use client'

import React, { useState, useEffect, useCallback } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { getPracticeRoomsAction } from "@/app/schedule/get.practice.rooms.action";
import { StudioRoomResponse } from "@/app/endpoint/studio.room.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const PracticeRoomView = ({ selectedDate, onChangeDate, locale, studioId }: {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  studioId?: number;
  locale: Locale;
}) => {
  const [rooms, setRooms] = useState<StudioRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPracticeRoomsAction();
      if ('studioRooms' in res) {
        setRooms(res.studioRooms);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-[#85898C] text-[15px] font-medium">
          {getLocaleString({ locale, key: 'no_practice_room' })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pt-3 pb-10 gap-3">
      {rooms.map((room) => {
        const imageUrl = room.imageUrls?.[0];

        return (
          <div
            key={room.id}
            onClick={() => kloudNav.push(KloudScreen.StudioRoomDetail(room.id))}
            className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                  <span className="text-[18px] font-bold text-white">{room.name}</span>
                  {room.practiceMaxNumber != null && room.practiceMaxNumber > 0 && (
                    <div className="mt-1.5">
                      <span className="text-[12px] text-white/70">
                        {getLocaleString({ locale, key: 'max_capacity' })} {room.practiceMaxNumber}{getLocaleString({ locale, key: 'people' })}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-[#F1F3F6] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                    <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5"/>
                    <path d="M3 11H25" stroke="#CDD1D5" strokeWidth="1.5"/>
                    <circle cx="9" cy="8" r="1" fill="#CDD1D5"/>
                    <circle cx="14" cy="8" r="1" fill="#CDD1D5"/>
                    <circle cx="19" cy="8" r="1" fill="#CDD1D5"/>
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                  <span className="text-[18px] font-bold text-[#333]">{room.name}</span>
                  {room.practiceMaxNumber != null && room.practiceMaxNumber > 0 && (
                    <div className="mt-1.5">
                      <span className="text-[12px] text-[#86898C]">
                        {getLocaleString({ locale, key: 'max_capacity' })} {room.practiceMaxNumber}{getLocaleString({ locale, key: 'people' })}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
