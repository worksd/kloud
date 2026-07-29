'use client'

import React, { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { RoomBookingStudioRoom } from "@/app/endpoint/room.booking.endpoint";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";

const FLOOR_LABEL: Record<string, Record<Locale, string>> = {
  Wood: { ko: '원목', en: 'Wood', jp: '木材', zh: '木地板' },
  Marley: { ko: '마루(마레)', en: 'Marley', jp: 'マーレー', zh: '玛丽地板' },
  Vinyl: { ko: '장판', en: 'Vinyl', jp: 'ビニール', zh: 'PVC地板' },
  Tile: { ko: '타일', en: 'Tile', jp: 'タイル', zh: '瓷砖' },
};

// 대관 예약 상세 — 홀 정보(설명·면적·크기·바닥·시설). 홀 바텀시트와 동일한 표현.
export const RoomBookingHallInfo = ({ room, locale }: { room: RoomBookingStudioRoom; locale: Locale }) => {
  const [open, setOpen] = useState(true);
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const enabledAmenities = (room.amenities ?? []).filter((a) => a.enabled);
  const { widthMeter: w, depthMeter: d, heightMeter: h } = room;
  const dimStr = (w || d || h) ? `${w ?? '-'} x ${d ?? '-'} x ${h ?? '-'} m` : null;
  const floorBase = room.floorType ? (FLOOR_LABEL[room.floorType]?.[locale] ?? room.floorType) : null;
  const floorStr = floorBase ? (room.isElasticFloor ? `${floorBase} · ${t('community_floor_elastic')}` : floorBase) : null;

  const specs: { label: string; value: string }[] = [];
  if (room.maxNumber && room.maxNumber > 0) specs.push({ label: t('max_capacity'), value: t('community_max_people').replace('{count}', String(room.maxNumber)) });
  if (room.areaSize) specs.push({ label: t('community_area'), value: `${room.areaSize}㎡` });
  if (dimStr) specs.push({ label: t('community_dimensions'), value: dimStr });
  if (floorStr) specs.push({ label: t('community_floor'), value: floorStr });

  const hasDesc = !!room.description && room.description.replace(/<[^>]*>/g, '').trim() !== '';
  if (!hasDesc && specs.length === 0 && enabledAmenities.length === 0) return null;

  return (
    <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="12" cy="12" r="9" stroke="#3CC0AF" strokeWidth="1.6" />
            <path d="M12 11v5M12 8h.01" stroke="#3CC0AF" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-bold text-[#171717]">{t('community_room_info')}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {hasDesc && (
            <div
              className="text-[13px] text-[#4E5968] leading-relaxed whitespace-pre-line break-words [&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:text-[#171717] [&_h1]:my-1 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-[#171717] [&_h2]:my-1 [&_p]:my-0.5"
              dangerouslySetInnerHTML={{ __html: room.description! }}
            />
          )}
          {specs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#86898C]">{s.label}</span>
                  <span className="text-[13px] font-medium text-[#171717]">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {enabledAmenities.length > 0 && (
            <div>
              <p className="text-[12px] text-[#86898C] mb-1.5">{t('community_room_facility')}</p>
              <div className="flex flex-wrap gap-1.5">
                {enabledAmenities.map((a) => (
                  <span key={a.amenity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EEF0F2] text-[12px] font-medium text-[#333]">
                    <PracticeAmenityIcon name={a.label} className="w-3.5 h-3.5 shrink-0" />
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
