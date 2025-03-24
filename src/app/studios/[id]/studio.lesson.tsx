"use client";

import { calculateDDays } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

const LessonCardInStudio = (data: GetLessonResponse) => {
    const handleClick = (() => {
      window.KloudEvent?.push(KloudScreen.LessonDetail(data.id))
    });

    return (
        <button onClick={handleClick} className="flex-col justify-start items-start gap-2 inline-flex w-[calc(100%/2.0479)]">
            <div className="w-full aspect-[0.75/1] rounded-2xl overflow-hidden relative">
                <Image
                    src={data.thumbnailUrl ?? ''}
                    alt={data.title ?? ''}
                    width={167}
                    height={222}
                    className="w-full h-full justify-start items-center inline-flex"
                />

                <div className="h-6 px-2 py-1 bg-black/60 rounded-xl justify-center items-center gap-2.5 inline-flex absolute bottom-[10px] right-3">
                    <div className="text-white text-xs font-medium leading-none">{calculateDDays(data.startTime ?? '')}</div>
                </div>
            </div>
            <div className="px-1 flex-col justify-start items-start gap-1 flex">
                <div className="self-stretch text-black text-sm font-bold leading-tight">{data.title}</div>
                <div className="self-stretch text-[#86898c] text-xs font-medium leading-none">{data.startTime}</div>
            </div>
        </button>
    );
};

export default LessonCardInStudio;
