'use client'
import { LessonGenre } from "@/app/endpoint/lesson.endpoint";
import { LessonLevels, LessonType } from "@/entities/lesson/lesson";

export const LessonLabel = ({ label }: { label: string }) => {
  return (
    <div className="inline-block px-1 py-0.5 rounded-[6px] text-[12px] font-paperlogy bg-[#F5F5F8] text-[#707070] shadow-sm backdrop-blur-sm">
      {label}
    </div>
  );
};

export const LessonTypeLabel = ({ label }: { label: string }) => {

  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-[rgba(0,0,0,0.5)] text-white shadow-sm backdrop-blur-sm">
      {label}
    </div>
  );
};

export const LessonPosterTypeLabel = ({ label }: { label: string }) => {

  return (
    <div
      className="absolute top-0 left-0 text-white text-[12px] font-bold py-[6px] pl-[12px] pr-[8px] rounded-tl-[16px] rounded-br-[10px] font-paperlogy"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      {label}
    </div>
  )
}

export const LessonLevelLabel = ({label}: { label: string }) => {
  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-black text-white shadow-sm backdrop-blur-sm">
      {label}
    </div>
  );
}